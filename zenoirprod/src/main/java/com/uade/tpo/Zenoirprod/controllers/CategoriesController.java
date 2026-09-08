package com.uade.tpo.Zenoirprod.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.entity.dto.CategoryRequest;
import com.uade.tpo.Zenoirprod.exceptions.CategoryDuplicateException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInvalidaException;
import com.uade.tpo.Zenoirprod.exceptions.PaginacionInvalidaException;
import com.uade.tpo.Zenoirprod.service.CategoryService;
import com.uade.tpo.Zenoirprod.util.PageableFactory;

import java.net.URI;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("categories")
public class CategoriesController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<Category>> getCategories(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) throws PaginacionInvalidaException {
        return ResponseEntity.ok(categoryService.getCategories(PageableFactory.crear(page, size)));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Integer categoryId) {
        Optional<Category> result = categoryService.getCategoryById(categoryId);
        if (result.isPresent())
            return ResponseEntity.ok(result.get());

        return ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> createCategory(@RequestBody CategoryRequest categoryRequest)
            throws CategoryDuplicateException, CategoryInvalidaException {
        Category result = categoryService.createCategory(categoryRequest.getNombre(), categoryRequest.getActivo());
        return ResponseEntity.created(URI.create("/categories/" + result.getId())).body(result);
    }

    @PatchMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Integer categoryId,
            @RequestBody CategoryRequest categoryRequest)
            throws CategoryInexistenteException, CategoryDuplicateException, CategoryInvalidaException {
        return ResponseEntity.ok(categoryService.updateCategory(
                categoryId, categoryRequest.getNombre(), categoryRequest.getActivo()));
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer categoryId)
            throws CategoryInexistenteException, CategoryEnUsoException {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}
