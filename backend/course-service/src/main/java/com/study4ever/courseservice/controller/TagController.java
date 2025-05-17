package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.TagRequestDto;
import com.study4ever.courseservice.model.Tag;
import com.study4ever.courseservice.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Tag createTag(@Valid @RequestBody TagRequestDto tagRequestDto) {
        return tagService.createTag(tagRequestDto);
    }

    @GetMapping
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    @GetMapping("/{id}")
    public Tag getTagById(@PathVariable("id") Long id) {
        return tagService.getTagById(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTag(@PathVariable("id") Long id) {
        tagService.deleteTag(id);
    }
}