package com.trustmedai.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class TurnstileService {

    @Value("${cloudflare.turnstile.secret-key}")
    private String secretKey;

    private final WebClient webClient = WebClient.create();

    public boolean verifyToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("secret", secretKey);
            formData.add("response", token);

            Map<String, Object> response = webClient.post()
                    .uri("https://challenges.cloudflare.com/turnstile/v0/siteverify")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .bodyValue(formData)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            Boolean success = (Boolean) response.get("success");
            return Boolean.TRUE.equals(success);

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}