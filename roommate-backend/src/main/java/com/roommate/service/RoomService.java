package com.roommate.service;

import com.roommate.entity.Room;
import com.roommate.entity.RoomType;
import com.roommate.entity.User;
import com.roommate.exception.ApiException;
import com.roommate.repository.RequestRepository;
import com.roommate.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

// Manages room listings including search filters, ownership validation, and cascading deletion
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RequestRepository requestRepository;
    private final UserService userService;

    public RoomService(RoomRepository roomRepository, RequestRepository requestRepository, UserService userService) {
        this.roomRepository = roomRepository;
        this.requestRepository = requestRepository;
        this.userService = userService;
    }

    public List<Room> searchRooms(String location, Integer maxRent, RoomType roomType) {
        String cleanLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
        return roomRepository.searchRooms(cleanLocation, maxRent, roomType);
    }

    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Room not found"));
    }

    public List<Room> getMyRooms(Long currentUserId) {
        User currentUser = userService.getAuthenticatedUser(currentUserId);
        return roomRepository.findByOwnerIdOrderByIdDesc(currentUser.getId());
    }

    @Transactional
    public Room createRoom(Room room, Long currentUserId) {
        User currentUser = userService.getAuthenticatedUser(currentUserId);
        room.setOwner(currentUser);
        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(Long id, Room updatedRoom, Long currentUserId) {
        User currentUser = userService.getAuthenticatedUser(currentUserId);
        Room existingRoom = getRoomById(id);

        if (!existingRoom.getOwner().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only edit your own rooms");
        }

        existingRoom.setTitle(updatedRoom.getTitle());
        existingRoom.setLocation(updatedRoom.getLocation());
        existingRoom.setRent(updatedRoom.getRent());
        existingRoom.setRoomType(updatedRoom.getRoomType());
        existingRoom.setDescription(updatedRoom.getDescription());
        existingRoom.setAvailableFrom(updatedRoom.getAvailableFrom());
        existingRoom.setContact(updatedRoom.getContact());

        return roomRepository.save(existingRoom);
    }

    @Transactional
    public void deleteRoom(Long id, Long currentUserId) {
        User currentUser = userService.getAuthenticatedUser(currentUserId);
        Room existingRoom = getRoomById(id);

        if (!existingRoom.getOwner().getId().equals(currentUser.getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not allowed to delete this room");
        }

        // Explicitly remove associated requests first to avoid foreign key integrity violations
        requestRepository.deleteByRoomId(id);
        roomRepository.delete(existingRoom);
    }
}
