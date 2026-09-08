package com.trustmedai.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;

@Service
public class EkaAppointmentService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${EKA_CLIENT_ID:}")
    private String clientId;

    @Value("${EKA_CLIENT_SECRET:}")
    private String clientSecret;

    @Value("${EKA_API_BASE_URL:https://api.eka.care}")
    private String baseUrl;

    private volatile String accessToken;

    public EkaAppointmentService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public Object getBusinessEntities() {
        return exchange("/dr/v1/business/entities", HttpMethod.GET, null);
    }

    public Object getSlots(String doctorId, String clinicId) {
        return exchange(
                "/dr/v1/doctor/" + doctorId + "/clinic/" + clinicId + "/appointment/slot",
                HttpMethod.GET,
                null
        );
    }

    public Object bookAppointment(Map<String, Object> request) {
        return exchange("/dr/v1/appointment", HttpMethod.POST, request);
    }

    private Object exchange(String path, HttpMethod method, Object body) {
        ensureConfigured();

        try {
            return send(path, method, body);
        } catch (HttpStatusCodeException error) {
            if (error.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                accessToken = null;
                return send(path, method, body);
            }
            throw upstreamError(error);
        }
    }

    private Object send(String path, HttpMethod method, Object body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("auth", getAccessToken());

        try {
            Object response = restTemplate.exchange(
                    normalizedBaseUrl() + path,
                    method,
                    new HttpEntity<>(body, headers),
                    Object.class
            ).getBody();

            if (response instanceof String text && text.trim().startsWith("{")) {
                return objectMapper.readValue(text, Object.class);
            }

            return response;
        } catch (HttpStatusCodeException error) {
            throw error;
        } catch (Exception error) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to connect to Eka Care: " + error.getMessage()
            );
        }
    }

    private synchronized String getAccessToken() {
        if (accessToken != null && !accessToken.isBlank()) {
            return accessToken;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> credentials = Map.of(
                "client_id", clientId,
                "client_secret", clientSecret
        );

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    normalizedBaseUrl() + "/connect-auth/v1/account/login",
                    HttpMethod.POST,
                    new HttpEntity<>(credentials, headers),
                    Map.class
            );

            Object token = response.getBody() == null ? null : response.getBody().get("access_token");
            if (token == null || token.toString().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Eka Care returned no access token.");
            }

            accessToken = token.toString();
            return accessToken;
        } catch (HttpStatusCodeException error) {
            throw upstreamError(error);
        }
    }

    private void ensureConfigured() {
        if (clientId.isBlank() || clientSecret.isBlank()
                || clientId.startsWith("your_") || clientSecret.startsWith("your_")) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Eka Care credentials are not configured."
            );
        }
    }

    private String normalizedBaseUrl() {
        return baseUrl.replaceAll("/+$", "");
    }

    private ResponseStatusException upstreamError(HttpStatusCodeException error) {
        String message = error.getResponseBodyAsString();
        if (message == null || message.isBlank()) {
            message = "Eka Care request failed with status " + error.getStatusCode().value();
        }
        return new ResponseStatusException(HttpStatus.BAD_GATEWAY, message);
    }
}
