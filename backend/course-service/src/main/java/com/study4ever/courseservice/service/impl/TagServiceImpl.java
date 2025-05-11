package com.study4ever.courseservice.service.impl;

import com.study4ever.courseservice.dto.TagRequestDto;
import com.study4ever.courseservice.exception.NotFoundException;
import com.study4ever.courseservice.exception.TagNameConflictException;
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
                .orElseThrow(() -> new NotFoundException("Tag not found"));
    }

    @Override
    public Tag createTag(TagRequestDto tagRequestDto) {
        String tagName = tagRequestDto.getName().trim();
        if (tagRepository.existsByNameIgnoreCase(tagName)) {
            throw new TagNameConflictException("Tag with name '" + tagName + "' already exists");
        }

        Tag tag = new Tag();
        tag.setName(tagName);
        return tagRepository.save(tag);
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