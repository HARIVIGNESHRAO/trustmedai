package com.trustmedai.backend.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public class HashUtil {

    public static String sha256(String data) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash =
                    digest.digest(
                            data.getBytes(StandardCharsets.UTF_8)
                    );

            StringBuilder hex =
                    new StringBuilder();

            for (byte b : hash) {
                hex.append(
                        String.format("%02x", b)
                );
            }

            return hex.toString();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}