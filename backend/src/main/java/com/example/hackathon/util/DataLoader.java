package com.example.hackathon.util;

import com.example.hackathon.model.Role;
import com.example.hackathon.model.User;
import com.example.hackathon.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataLoader {
    @Bean
    CommandLineRunner seed(UserRepository userRepository) {
        return args -> {
            if (userRepository.count() == 0) {
                BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
                userRepository.save(new User(null, "admin", enc.encode("adminpass"), Role.ADMIN));
                userRepository.save(new User(null, "panelist", enc.encode("panelistpass"), Role.PANELIST));
                userRepository.save(new User(null, "participant", enc.encode("participantpass"), Role.PARTICIPANT));
            }
        };
    }
}
