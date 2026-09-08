package com.trustmedai.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trustmedai.backend.dto.*;
import com.trustmedai.backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.trustmedai.backend.entity.User;
import com.trustmedai.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.trustmedai.backend.service.FollowUpPlanService;
import java.util.Objects;
import java.util.*;

import com.trustmedai.backend.security.JwtUtil;
import com.trustmedai.backend.entity.PredictionHistory;
import com.trustmedai.backend.repository.PredictionHistoryRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import java.time.LocalDateTime;

import org.springframework.security.core.Authentication;
import com.trustmedai.backend.util.HashUtil;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api")
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "http://localhost",
                "capacitor://localhost",
                "http://192.168.1.101"
        },
        allowCredentials = "true"
)
public class TestController {

    @Autowired
    private PredictionService predictionService;
    @Autowired
    private FollowUpPlanService followUpPlanService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;
    // Manual Prediction
    @Autowired
    private AuditLogService auditLogService;
    @Autowired
    private HealthTrendService healthTrendService;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private PredictionHistoryRepository predictionHistoryRepository;
    @Autowired
    private PdfService pdfService;
    @Autowired
    private MetricsService metricsService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private TurnstileService turnstileService;
    @Autowired
    private OtpService otpService;
    @Autowired
    private FabricLedgerService fabricLedgerService;
    private String getLoggedInEmail(Authentication authentication) {

        if (authentication.getPrincipal() instanceof org.springframework.security.oauth2.core.user.OAuth2User oauthUser) {

            return oauthUser.getAttribute("email");

        }

        return authentication.getName();

    }
    @PostMapping("/analyze")
    public String analyze(
            @RequestBody PredictionRequest request) {
        metricsService.predictionMade();
        return predictionService.predict(request);
    }

    // OCR Prediction


    @PostMapping("/voice-report")
    public String uploadVoiceReport(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws Exception {
        String result = predictionService.analyzeVoiceReport(file);
        return savePredictionResult(file, authentication, result, "VOICE_REPORT");
    }


    @PostMapping("/upload-report")
    public String uploadReport(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws Exception {
        String result =
                predictionService.analyzeReport(file);
        return savePredictionResult(file, authentication, result, "UPLOAD_REPORT");
    }

    private String savePredictionResult(
            MultipartFile file,
            Authentication authentication,
            String result,
            String auditAction
    ) throws Exception {
        String email = getLoggedInEmail(authentication);

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> response = mapper.readValue(
                result,
                new TypeReference<Map<String, Object>>() {}
        );

        if (Boolean.FALSE.equals(response.get("success"))) {
            return mapper.writeValueAsString(response);
        }

        auditLogService.log(
                email,
                "AI_PREDICTION",
                "Disease prediction generated",
                "SUCCESS",
                "LOCALHOST"
        );

        PredictionHistory history =
                new PredictionHistory();

        history.setUserEmail(email);

        history.setReportName(
                file.getOriginalFilename()
        );

        history.setPredictionResult(
                result
        );

        history.setCreatedAt(
                LocalDateTime.now()
        );
        String reportData =
                email +
                        file.getOriginalFilename() +
                        result;

        String reportHash =
                HashUtil.sha256(reportData);

        PredictionHistory lastBlock =
                predictionHistoryRepository.findTopByOrderByBlockNumberDesc();

        String previousHash;
        int blockNumber;

        if (lastBlock == null) {

            previousHash = "GENESIS";

            blockNumber = 1;

        } else {

            previousHash =
                    lastBlock.getCurrentHash();

            blockNumber =
                    (lastBlock.getBlockNumber() == null)
                            ? 1
                            : lastBlock.getBlockNumber() + 1;
        }

        String currentHash =
                HashUtil.sha256(
                        reportHash +
                                previousHash +
                                blockNumber
                );

        history.setReportHash(reportHash);

        history.setPreviousHash(previousHash);

        history.setCurrentHash(currentHash);

        history.setBlockNumber(blockNumber);
        System.out.println("BLOCK NUMBER = " + blockNumber);
        System.out.println("PREVIOUS HASH = " + previousHash);
        System.out.println("CURRENT HASH = " + currentHash);
        auditLogService.log(
                email,
                auditAction,
                "Medical report uploaded: " +
                        file.getOriginalFilename(),
                "SUCCESS",
                "LOCALHOST"
        );
        metricsService.reportUploaded();
        metricsService.predictionMade();



        Object parameters = response.get("parameters");

        if (parameters != null) {

            history.setHealthParameters(
                    mapper.writeValueAsString(parameters)
            );

        }
        List<Map<String, Object>> predictions =
                (List<Map<String, Object>>) response.get("predictions");

        List<Map<String, Object>> followUpPlans = new ArrayList<>();

        if (predictions != null) {

            for (Map<String, Object> prediction : predictions) {

                String disease = prediction.get("disease").toString();
                String risk = prediction.get("risk").toString();

                Map<String, Object> plan =
                        followUpPlanService.generate(disease, risk);

                plan.put("disease", disease);
                plan.put("risk", risk);

                followUpPlans.add(plan);
            }
        }

        response.put("followUpPlans", followUpPlans);
        PredictionHistory savedHistory = predictionHistoryRepository.save(history);

        // The database keeps private clinical data. Fabric receives only the report ID,
        // SHA-256 proof, model version, and timestamp.
        if (fabricLedgerService.isEnabled()) {
            Map<String, Object> proof = fabricLedgerService.createReportProof(
                    savedHistory.getId(),
                    savedHistory.getReportHash(),
                    savedHistory.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant()
            );
            savedHistory.setFabricTransactionId(String.valueOf(proof.get("transactionId")));
            savedHistory.setFabricChannel("mychannel");
            savedHistory.setFabricChaincode("reportproof");
            savedHistory.setLedgerStatus("FABRIC_COMMITTED");
            savedHistory = predictionHistoryRepository.save(savedHistory);
        } else {
            savedHistory.setLedgerStatus("LOCAL_HASH_CHAIN_ONLY");
            savedHistory = predictionHistoryRepository.save(savedHistory);
        }

        response.put(
                "predictionId",
                savedHistory.getId()
        );
        response.put("ledgerStatus", savedHistory.getLedgerStatus());
        response.put("fabricTransactionId", savedHistory.getFabricTransactionId());
        response.put(
                "predictionId",
                savedHistory.getId()
        );
        System.out.println("========== PREDICTIONS ==========");
        System.out.println(predictions);

        System.out.println("========== FOLLOW UP ==========");
        System.out.println(followUpPlans);
        System.out.println("========== RESPONSE ==========");
        System.out.println(response);
        return mapper.writeValueAsString(response);

    }

    @PostMapping("/recommend-hospitals")
    public String recommendHospitals(
            @RequestBody
            HospitalRequest request
    ) {
        metricsService.hospitalRecommended();
        auditLogService.log(
                "SYSTEM",
                "HOSPITAL_RECOMMENDATION",
                "Hospital recommendation generated",
                "SUCCESS",
                "LOCALHOST"
        );
        return predictionService
                .recommendHospitals(
                        request
                );
    }
    @GetMapping("/health-trends")
    public Map<String, TrendResponse> getHealthTrends(
            Authentication authentication
    ) {

        String email = getLoggedInEmail(authentication);

        List<PredictionHistory> reports =
                predictionHistoryRepository.findByUserEmail(email);

        return healthTrendService.generateTrend(reports);
    }
    @GetMapping("/prediction-history")
    public List<PredictionHistory> getHistory(
            Authentication authentication
    ) {

        String email =
                getLoggedInEmail(authentication);

        return predictionHistoryRepository
                .findByUserEmail(email);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/register")
    public String register(
            @RequestBody RegisterRequest request
    ) {

        User user = new User();

        user.setUsername(
                request.getUsername()
        );

        user.setEmail(
                request.getEmail()
        );

        user.setPhone(
                request.getPhone()
        );

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.getPassword()
                )
        );

        userRepository.save(user);
        auditLogService.log(
                user.getEmail(),
                "REGISTER",
                "New account created",
                "SUCCESS",
                "LOCALHOST"
        );
        return "User Registered Successfully";
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        System.out.println("LOGIN API HIT");

        // Cloudflare Turnstile Verification
        if (request.getTurnstileToken() == null || request.getTurnstileToken().isEmpty()) {
            throw new RuntimeException("Security verification failed. Please complete the check.");
        }

        if (!turnstileService.verifyToken(request.getTurnstileToken())) {
            throw new RuntimeException("Security verification failed. Please try again.");
        }

        User user = userRepository
                .findByUsername(request.getUsername())
                .orElse(null);

        if (user == null) {
            throw new RuntimeException("User Not Found");
        }

        boolean matches = passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash()
        );

        if (!matches) {

            auditLogService.log(
                    user.getEmail(),
                    "LOGIN",
                    "Invalid password entered",
                    "FAILED",
                    "LOCALHOST"
            );

            throw new RuntimeException("Invalid Password");
        }

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole()
        );
        metricsService.loginSuccess();
        auditLogService.log(
                user.getEmail(),
                "LOGIN",
                "User logged in successfully",
                "SUCCESS",
                "LOCALHOST"
        );
        return new LoginResponse(
                token,
                "Login Successful",
                user.getRole()
        );
    }
    @GetMapping("/hello")
    public String hello() {
        return "HELLO";
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/blockchain")
    public List<PredictionHistory> blockchain() {

        return predictionHistoryRepository
                .findAll();
    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/verify-chain")
    public Map<String, Object> verifyChain() {
        auditLogService.log(
                "ADMIN",
                "BLOCKCHAIN_VERIFY",
                "Blockchain verification executed",
                "SUCCESS",
                "LOCALHOST"
        );
        metricsService.blockchainVerified();

        List<PredictionHistory> blocks =
                predictionHistoryRepository.findAllByOrderByBlockNumberAsc();

        for (int i = 1; i < blocks.size(); i++) {

            PredictionHistory current = blocks.get(i);
            PredictionHistory previous = blocks.get(i - 1);

            if (!Objects.equals(
                    current.getPreviousHash(),
                    previous.getCurrentHash()
            )) {

                return Map.of(
                        "verified", false,
                        "failedBlock", current.getBlockNumber(),
                        "expected", previous.getCurrentHash(),
                        "found", current.getPreviousHash(),
                        "message", "Blockchain Tampered"
                );
            }
        }

        return Map.of(
                "verified", true,
                "message", "Blockchain Verified"
        );
    }
    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            throw new RuntimeException("Email not registered");
        }

        // Clear old OTP data
        otpService.removeOtp(request.getEmail());

        String otp = otpService.generateOtp(request.getEmail());

        emailService.sendOtp(request.getEmail(), otp);

        return "OTP Sent Successfully to your email";
    }

    @PostMapping("/verify-otp")
    public String verifyOtp(@RequestBody VerifyOtpRequest request) {

        boolean valid = otpService.verifyOtp(request.getEmail(), request.getOtp());

        if (!valid) {
            otpService.clearVerification(request.getEmail());
            throw new RuntimeException("Invalid or Expired OTP");
        }

        otpService.markVerified(request.getEmail());
        return "OTP Verified Successfully";
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordRequest request) {

        if (!otpService.isVerified(request.getEmail())) {
            throw new RuntimeException("OTP Verification Required");
        }

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setRole("ROLE_USER");
        userRepository.save(user);

        // Clean up OTP after successful reset
        otpService.removeOtp(request.getEmail());

        return "Password Reset Successful";
    }
    @GetMapping("/download-report/{id}")
    public ResponseEntity<byte[]> downloadReport(
            @PathVariable Long id,
            Authentication authentication
    )throws Exception {

        PredictionHistory history =
                predictionHistoryRepository
                        .findById(id)
                        .orElseThrow();

        String email = getLoggedInEmail(authentication);

        User user =
                userRepository.findByEmail(email)
                        .orElseThrow();

        if (
                user.getRole().equals("ROLE_USER") &&
                        !history.getUserEmail().equals(email)
        ) {

            throw new RuntimeException("Access Denied");

        }

        byte[] pdf =
                pdfService.generatePdf(history);
        metricsService.pdfDownloaded();
        auditLogService.log(
                email,
                "PDF_DOWNLOAD",
                "Downloaded report: " +
                        history.getReportName(),
                "SUCCESS",
                "LOCALHOST"
        );
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=TrustMedAI_Report.pdf"
                )
                .contentType(
                        MediaType.APPLICATION_PDF
                )
                .body(pdf);
    }
    @PutMapping("/save-hospitals")
    public ResponseEntity<?> saveHospitalRecommendations(

            @RequestBody HospitalRecommendationSaveRequest request

    ) {

        PredictionHistory history =
                predictionHistoryRepository
                        .findById(request.getPredictionId())
                        .orElseThrow(() ->
                                new RuntimeException("Prediction not found"));

        history.setHospitalRecommendations(
                request.getHospitalRecommendations()
        );

        predictionHistoryRepository.save(history);

        return ResponseEntity.ok(
                "Hospital recommendations saved successfully."
        );
    }
}
