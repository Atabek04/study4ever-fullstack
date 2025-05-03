package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.TagRequestDto;
import com.study4ever.courseservice.model.Tag;
import com.study4ever.courseservice.repository.TagRepository;
import com.study4ever.courseservice.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagRepository tagRepository;

    @Override
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Override
    public Tag getTagById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
    }

    @Override
    public Tag createTag(TagRequestDto tagRequestDto) {
        Tag tag = new Tag();
        tag.setName(tagRequestDto.getName());
        return tagRepository.save(tag);
    }

    @Override
    public Tag updateTag(Long id, TagRequestDto tagRequestDto) {
        Tag existingTag = getTagById(id);
        existingTag.setName(tagRequestDto.getName());
        return tagRepository.save(existingTag);
    }

    @Override
    public void deleteTag(Long id) {
        tagRepository.deleteById(id);
    }

    @Override
    public Set<Tag> getTagsByIds(Set<Long> ids) {
        return new HashSet<>(tagRepository.findAllById(ids));
    }
}