
package com.uade.tpo.Zenoirprod.service;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.exceptions.CategoryDuplicateException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInvalidaException;

public interface CategoryService {
    public Page<Category> getCategories(PageRequest pageRequest);

    public Optional<Category> getCategoryById(Integer categoryId);

    public Category createCategory(String nombre, Boolean activo)
            throws CategoryDuplicateException, CategoryInvalidaException;

    public Category updateCategory(Integer id, String nombre, Boolean activo)
            throws CategoryInexistenteException, CategoryDuplicateException, CategoryInvalidaException;

    public void deleteCategory(Integer id) throws CategoryInexistenteException, CategoryEnUsoException;
}
