package rs.levi9.socbook1.web.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import rs.levi9.socbook1.domain.Bookmark;
import rs.levi9.socbook1.domain.Comment;
import rs.levi9.socbook1.domain.Role;
import rs.levi9.socbook1.domain.User;
import rs.levi9.socbook1.service.BookmarkService;
import rs.levi9.socbook1.service.CommentService;
import rs.levi9.socbook1.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    private CommentService commentService;
    private BookmarkService bookmarkService;
    private UserService userService;

    public CommentController(CommentService commentService, BookmarkService bookmarkService, UserService userService) {
        this.commentService = commentService;
        this.bookmarkService = bookmarkService;
        this.userService = userService;
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @RequestMapping(path = "/{bookmark_id}", method = RequestMethod.POST)
    public ResponseEntity<Comment> save(@RequestBody Comment comment, @PathVariable("bookmark_id") Long id) {
        //Get user who posts.
        Bookmark commentedBookmark = bookmarkService.findOne(id);

        commentedBookmark.getComments().add(comment);

        bookmarkService.save(commentedBookmark);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<Comment> findAll() {

        return commentService.findAll();
    }

    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @RequestMapping(path = "/{id}", method = RequestMethod.DELETE)
    public ResponseEntity delete(@PathVariable Long id) {
        //Test
        Bookmark bookmarkWithComment = bookmarkService.findBookmarkByCommentId(id);
        Comment commentToDelete = commentService.findOne(id);
        User loggedUser = userService.findByUserName(getLoggedUserName());

        if (!commentToDelete.getUser().equals(loggedUser) || !isUserAdmin(loggedUser)) {
            return new ResponseEntity(HttpStatus.BAD_REQUEST);
        }

        for (Comment c : bookmarkWithComment.getComments()) {
            if (commentToDelete.equals(c)) {
                bookmarkWithComment.getComments().remove(c);
            }
        }

        commentService.delete(id);

        return new ResponseEntity(HttpStatus.OK);
    }

    private String getLoggedUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }

    private boolean isUserAdmin(User user) {
        for (Role role : user.getRoles()) {
            if (role.getType().equals(Role.RoleType.ROLE_ADMIN)) {
                return true;
            }
        }
        return false;
    }
}
