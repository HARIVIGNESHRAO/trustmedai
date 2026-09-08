package com.trustmedai.backend.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import com.trustmedai.backend.entity.User;
import com.trustmedai.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class OAuthController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user")
    public Map<String, Object> user(
            @AuthenticationPrincipal OAuth2User principal
    ) {

        if (principal == null) {
            return Map.of(
                    "message",
                    "Not Logged In"
            );
        }

        String email =
                principal.getAttribute("email");

        String name =
                principal.getAttribute("name");

        User user =
                userRepository
                        .findByEmail(email)
                        .orElse(null);

        if (user == null) {

            user = new User();

            user.setUsername(
                    name.replace(" ", "")
            );

            user.setEmail(email);

            user.setPhone("Google Login");

            user.setPasswordHash(
                    "GOOGLE_AUTH"
            );

            userRepository.save(user);
        }

        return principal.getAttributes();
    }
    @GetMapping("/current-user")
    public Map<String, Object> currentUser(
            @AuthenticationPrincipal OAuth2User principal
    ) {

        if (principal == null) {

            return Map.of(
                    "authenticated",
                    false
            );
        }

        System.out.println(
                principal.getAttributes()
        );

        Map<String, Object> response =
                new java.util.HashMap<>();

        response.put(
                "authenticated",
                true
        );

        response.put(
                "name",
                principal.getAttribute("name")
        );

        response.put(
                "email",
                principal.getAttribute("email")
        );

        response.put(
                "picture",
                principal.getAttribute("picture")
        );

        return response;
    }
}