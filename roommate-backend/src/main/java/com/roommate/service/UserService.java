package com.roommate.service;

import com.roommate.entity.User;
import com.roommate.exception.ApiException;
import com.roommate.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Handles user registration, authentication, and profile updates with business rule enforcement
@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User register(User user) {
        if (user.getPassword() == null || user.getPassword().trim().length() < 6) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User login(String email, String password) {
        if (email == null || password == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return user;
    }

    public User getUserProfile(Long id, Long currentUserId) {
        if (currentUserId == null || !currentUserId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to view this profile");
        }

        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    @Transactional
    public User updateUserProfile(Long id, User updatedData, Long currentUserId) {
        if (currentUserId == null || !currentUserId.equals(id)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to update this profile");
        }

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (updatedData.getName() != null && !updatedData.getName().trim().isEmpty()) {
            if (updatedData.getName().trim().length() < 2 || updatedData.getName().trim().length() > 50) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Name must be between 2 and 50 characters");
            }
            existingUser.setName(updatedData.getName().trim());
        }

        if (updatedData.getOrganizationName() != null && !updatedData.getOrganizationName().trim().isEmpty()) {
            existingUser.setOrganizationName(updatedData.getOrganizationName().trim());
        }

        if (updatedData.getLocation() != null && !updatedData.getLocation().trim().isEmpty()) {
            existingUser.setLocation(updatedData.getLocation().trim());
        }

        existingUser.setPreferredLocation(updatedData.getPreferredLocation());

        if (updatedData.getBudget() != null) {
            if (updatedData.getBudget() < 0) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Budget must be greater than or equal to 0");
            }
            existingUser.setBudget(updatedData.getBudget());
        }

        return userRepository.save(existingUser);
    }

    public User getAuthenticatedUser(Long userId) {
        if (userId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please log in first");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
