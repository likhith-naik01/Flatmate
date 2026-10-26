package com.roommate.service;

import com.roommate.entity.RequestStatus;
import com.roommate.entity.Room;
import com.roommate.entity.RoomRequest;
import com.roommate.entity.User;
import com.roommate.exception.ApiException;
import com.roommate.repository.RequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

// Governs room requests, ensuring request eligibility, duplicate prevention, and owner approvals
@Service
public class RequestService {

    private final RequestRepository requestRepository;
    private final RoomService roomService;
    private final UserService userService;

    public RequestService(RequestRepository requestRepository, RoomService roomService, UserService userService) {
        this.requestRepository = requestRepository;
        this.roomService = roomService;
        this.userService = userService;
    }

    @Transactional
    public RoomRequest createRequest(Long roomId, Long currentUserId) {
        if (roomId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Room ID is required");
        }

        User currentUser = userService.getAuthenticatedUser(currentUserId);
        Room room = roomService.getRoomById(roomId);

        if (room.getOwner().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot request your own room");
        }

        if (requestRepository.existsByRoomIdAndUserId(roomId, currentUser.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already requested this room");
        }

        RoomRequest request = new RoomRequest(room, currentUser);
        return requestRepository.save(request);
    }

    public List<RoomRequest> getSentRequests(Long currentUserId) {
        User currentUser = userService.getAuthenticatedUser(currentUserId);
        return requestRepository.findByUserIdOrderByIdDesc(currentUser.getId());
    }

    public List<RoomRequest> getReceivedRequests(Long currentUserId) {
        User currentUser = userService.getAuthenticatedUser(currentUserId);
        return requestRepository.findByRoomOwnerIdOrderByIdDesc(currentUser.getId());
    }

    @Transactional
    public RoomRequest acceptRequest(Long requestId, Long currentUserId) {
        return updateRequestStatus(requestId, currentUserId, RequestStatus.ACCEPTED);
    }

    @Transactional
    public RoomRequest rejectRequest(Long requestId, Long currentUserId) {
        return updateRequestStatus(requestId, currentUserId, RequestStatus.REJECTED);
    }

    private RoomRequest updateRequestStatus(Long requestId, Long currentUserId, RequestStatus newStatus) {
        User currentUser = userService.getAuthenticatedUser(currentUserId);
        RoomRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Request not found"));

        if (!request.getRoom().getOwner().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the room owner can update this request");
        }

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Request already decided");
        }

        request.setStatus(newStatus);
        return requestRepository.save(request);
    }
}
