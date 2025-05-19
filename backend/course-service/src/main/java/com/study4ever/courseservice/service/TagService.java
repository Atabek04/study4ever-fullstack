package com.study4ever.courseservice.service;

import com.study4ever.courseservice.dto.TagRequestDto;
import com.study4ever.courseservice.model.Tag;

import java.util.List;
import java.util.Set;

public interface TagService {

    List<Tag> getAllTags();

    Tag getTagById(Long id);

    Tag createTag(TagRequestDto tagRequestDto);

    void deleteTag(Long id);

    Set<Tag> getTagsByIds(Set<Long> ids);
}