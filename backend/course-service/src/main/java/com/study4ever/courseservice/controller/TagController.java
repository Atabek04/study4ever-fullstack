package com.study4ever.courseservice.controller;

import com.study4ever.courseservice.dto.TagRequestDto;
import com.study4ever.courseservice.model.Tag;
import com.study4ever.courseservice.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    @GetMapping("/{id}")
    public Tag getTagById(@PathVariable Long id) {
        return tagService.getTagById(id);
    }

    @PostMapping
    public Tag createTag(@Valid @RequestBody TagRequestDto tagRequestDto) {
        return tagService.createTag(tagRequestDto);
    }

    @PutMapping("/{id}")
    public Tag updateTag(@PathVariable Long id, @Valid @RequestBody TagRequestDto tagRequestDto) {
        return tagService.updateTag(id, tagRequestDto);
    }

    @DeleteMapping("/{id}")
    public void deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
    }
}