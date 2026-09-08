package com.trustmedai.backend.controller;

import com.trustmedai.backend.entity.PredictionHistory;
import com.trustmedai.backend.entity.User;
import com.trustmedai.backend.repository.PredictionHistoryRepository;
import com.trustmedai.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import com.trustmedai.backend.entity.AuditLog;
import com.trustmedai.backend.repository.AuditLogRepository;
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AuditLogRepository auditLogRepository;
    @Autowired
    private PredictionHistoryRepository predictionHistoryRepository;

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {

        Map<String, Object> dashboard = new HashMap<>();

        dashboard.put(
                "totalUsers",
                userRepository.count()
        );

        dashboard.put(
                "totalReports",
                predictionHistoryRepository.count()
        );

        dashboard.put(
                "totalPredictions",
                predictionHistoryRepository.count()
        );

        dashboard.put(
                "totalBlockchainBlocks",
                predictionHistoryRepository.count()
        );

        dashboard.put(
                "serverStatus",
                "Running"
        );

        return dashboard;
    }
    @GetMapping("/users")
    public List<User> getAllUsers() {

        return userRepository.findAll();

    }
    @DeleteMapping("/users/{id}")
    public String deleteUser(
            @PathVariable Long id
    ) {

        userRepository.deleteById(id);

        return "User Deleted Successfully";

    }
    @PutMapping("/users/{id}/role")
    public String updateRole(

            @PathVariable Long id,

            @RequestParam String role

    ) {

        User user =
                userRepository.findById(id)
                        .orElseThrow();

        user.setRole(role);

        userRepository.save(user);

        return "Role Updated";

    }
    @GetMapping("/predictions")
    public List<PredictionHistory> getPredictions() {

        return predictionHistoryRepository
                .findAllByOrderByBlockNumberAsc();

    }
    @DeleteMapping("/predictions/{id}")
    public String deletePrediction(
            @PathVariable Long id
    ) {

        predictionHistoryRepository.deleteById(id);

        return "Prediction Deleted";

    }
    @GetMapping("/blockchain")
    public List<PredictionHistory> blockchain() {

        return predictionHistoryRepository
                .findAllByOrderByBlockNumberAsc();

    }
    @GetMapping("/analytics")
    public Map<String, Object> analytics() {

        List<PredictionHistory> allHistory = predictionHistoryRepository.findAll();
        // ✅ removed allUsers — no longer needed

        long diabetes = allHistory.stream()
                .filter(p -> p.getPredictionResult() != null &&
                        p.getPredictionResult().toLowerCase().contains("diabetes"))
                .count();
        long heart = allHistory.stream()
                .filter(p -> p.getPredictionResult() != null &&
                        p.getPredictionResult().toLowerCase().contains("heart"))
                .count();
        long kidney = allHistory.stream()
                .filter(p -> p.getPredictionResult() != null &&
                        p.getPredictionResult().toLowerCase().contains("kidney"))
                .count();
        long liver = allHistory.stream()
                .filter(p -> p.getPredictionResult() != null &&
                        p.getPredictionResult().toLowerCase().contains("liver"))
                .count();
        long thyroid = allHistory.stream()
                .filter(p -> p.getPredictionResult() != null &&
                        p.getPredictionResult().toLowerCase().contains("thyroid"))
                .count();

        List<Map<String, Object>> diseaseDistribution = new ArrayList<>();
        if (diabetes > 0) diseaseDistribution.add(Map.of("name", "Diabetes", "value", diabetes));
        if (heart    > 0) diseaseDistribution.add(Map.of("name", "Heart",    "value", heart));
        if (kidney   > 0) diseaseDistribution.add(Map.of("name", "Kidney",   "value", kidney));
        if (liver    > 0) diseaseDistribution.add(Map.of("name", "Liver",    "value", liver));
        if (thyroid  > 0) diseaseDistribution.add(Map.of("name", "Thyroid",  "value", thyroid));

        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd MMM");
        Map<String, Long> reportsPerDayMap = new LinkedHashMap<>();
        allHistory.stream()
                .filter(h -> h.getCreatedAt() != null)
                .forEach(h -> reportsPerDayMap.merge(
                        h.getCreatedAt().format(dayFmt), 1L, Long::sum));

        List<Map<String, Object>> reportsPerDay = reportsPerDayMap.entrySet().stream()
                .map(e -> Map.<String, Object>of("name", e.getKey(), "value", e.getValue()))
                .collect(Collectors.toList());

        Map<String, Object> map = new HashMap<>();
        map.put("totalUsers",            userRepository.count());
        map.put("totalPredictions",      allHistory.size());
        map.put("totalReports",          allHistory.size());
        map.put("totalBlockchainBlocks", allHistory.size());
        map.put("diabetes",  diabetes);
        map.put("heart",     heart);
        map.put("kidney",    kidney);
        map.put("liver",     liver);
        map.put("thyroid",   thyroid);
        map.put("diseaseDistribution",         diseaseDistribution);
        map.put("predictionTrends",            new ArrayList<>(reportsPerDay));
        map.put("reportsPerDay",               reportsPerDay);
        map.put("userRegistrations",           new ArrayList<>()); // ✅ empty, no createdAt needed
        map.put("hospitalRecommendationCount", new ArrayList<>());
        return map;
    }


    @GetMapping("/audit-logs")
    public List<AuditLog> getAuditLogs() {

        System.out.println("========== AUDIT LOGS ==========");

        try {

            List<AuditLog> logs =
                    auditLogRepository.findTop500ByOrderByCreatedAtDesc();

            System.out.println("TOTAL LOGS = " + logs.size());

            return logs;

        } catch (Exception e) {

            System.out.println("EXCEPTION OCCURRED");

            e.printStackTrace();

            throw e;
        }
    }

}
