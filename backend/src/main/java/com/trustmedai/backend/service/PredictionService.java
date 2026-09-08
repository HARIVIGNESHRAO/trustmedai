package com.trustmedai.backend.service;

import com.trustmedai.backend.dto.PredictionRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import com.trustmedai.backend.dto.HospitalRequest;
@Service
public class PredictionService {

    @Value("${app.ai-base-url:http://localhost:8000}")
    private String aiBaseUrl;

    @Autowired
    private RestTemplate restTemplate;

    // Existing Manual Prediction

    public String predict(
            PredictionRequest request) {

        String url = aiBaseUrl + "/predict";

        return restTemplate.postForObject(
                url,
                request,
                String.class
        );
    }

    // OCR PDF/Image Prediction

    public String analyzeReport(
            MultipartFile file
    ) {

        try {

            String url = aiBaseUrl + "/ocr-predict";

            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.MULTIPART_FORM_DATA
            );

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            body.add(
                    "file",
                    new ByteArrayResource(
                            file.getBytes()
                    ) {
                        @Override
                        public String getFilename() {
                            return file.getOriginalFilename();
                        }
                    }
            );
            HttpEntity<
                    MultiValueMap<String, Object>
                    > requestEntity =
                    new HttpEntity<>(
                            body,
                            headers
                    );

            ResponseEntity<String> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            requestEntity,
                            String.class
                    );

            return response.getBody();

        }

        catch (Exception e) {

            throw new RuntimeException(
                    "Failed to analyze report: "
                            + e.getMessage()
            );
        }
    }

    public String analyzeVoiceReport(MultipartFile file) {
        return forwardFile(file, aiBaseUrl + "/voice-predict", "voice report");
    }

    private String forwardFile(MultipartFile file, String url, String description) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            return restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            ).getBody();
        } catch (Exception e) {
            throw new RuntimeException(
                    "Failed to analyze " + description + ": " + e.getMessage()
            );
        }
    }
    public String recommendHospitals(
            HospitalRequest request
    ) {

        String url = aiBaseUrl + "/recommend-hospitals";

        return restTemplate.postForObject(
                url,
                request,
                String.class
        );
    }
}
