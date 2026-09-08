package com.trustmedai.backend.security;

import com.trustmedai.backend.entity.User;
import com.trustmedai.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public OAuth2SuccessHandler(
            JwtUtil jwtUtil,
            UserRepository userRepository
    ) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        OAuth2User oauthUser =
                (OAuth2User) authentication.getPrincipal();
        System.out.println(oauthUser.getAttributes());
        String email = oauthUser.getAttribute("email");

        if (email == null) {
            email = oauthUser.getAttribute("preferred_username");
        }

        if (email == null) {
            email = oauthUser.getAttribute("mail");
        }

        String name = oauthUser.getAttribute("name");

        if (name == null) {
            name = email;
        }

        User user =
                userRepository.findByEmail(email)
                        .orElse(null);

        if (user == null) {

            user = new User();

            user.setUsername(
                    name.replace(" ", "")
            );

            user.setEmail(email);

            user.setPhone("OAuth Login");

            user.setPasswordHash("OAUTH");

            userRepository.save(user);
        }

        String jwt =
                jwtUtil.generateToken(
                        user.getEmail(),
                        user.getRole()
                );

        response.sendRedirect(
                frontendUrl.replaceAll("/+$", "") + "/oauth-success?token="
                        + jwt
                        + "&role="
                        + user.getRole()
        );
    }
}
