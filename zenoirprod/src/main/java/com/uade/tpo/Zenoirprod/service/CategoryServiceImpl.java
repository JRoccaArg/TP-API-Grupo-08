package com.uade.tpo.Zenoirprod.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.uade.tpo.Zenoirprod.entity.Category;
import com.uade.tpo.Zenoirprod.exceptions.CategoryDuplicateException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryEnUsoException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInexistenteException;
import com.uade.tpo.Zenoirprod.exceptions.CategoryInvalidaException;
import com.uade.tpo.Zenoirprod.repository.CategoryRepository;
import com.uade.tpo.Zenoirprod.repository.EventosRepository;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private EventosRepository eventosRepository;

    public Page<Category> getCategories(PageRequest pageable) {
        return categoryRepository.findAll(pageable);
    }

    public Optional<Category> getCategoryById(Integer categoryId) {
        return categoryRepository.findById(categoryId);
    }

    public Category createCategory(String nombre, Boolean activo)
            throws CategoryDuplicateException, CategoryInvalidaException {
        validarNombre(nombre);
        List<Category> categories = categoryRepository.findByNombre(nombre);
        if (categories.isEmpty())
            return categoryRepository.save(new Category(nombre, activo != null ? activo : true));
        throw new CategoryDuplicateException();
    }

    public Category updateCategory(Integer id, String nombre, Boolean activo)
            throws CategoryInexistenteException, CategoryDuplicateException, CategoryInvalidaException {
        Category category = categoryRepository.findById(id)
                .orElseThrow(CategoryInexistenteException::new);

        if (nombre != null) {
            validarNombre(nombre);
            if (categoryRepository.findByNombre(nombre).stream()
                    .anyMatch(categoria -> !categoria.getId().equals(id))) {
                throw new CategoryDuplicateException();
            }
            category.setNombre(nombre);
        }
        if (activo != null) {
            category.setActivo(activo);
        }
        return categoryRepository.save(category);
    }

    public void deleteCategory(Integer id) throws CategoryInexistenteException, CategoryEnUsoException {
        if (!categoryRepository.existsById(id)) {
            throw new CategoryInexistenteException();
        }
        if (eventosRepository.existsByCategoria_Id(id)) {
            throw new CategoryEnUsoException();
        }
        categoryRepository.deleteById(id);
    }

    private void validarNombre(String nombre) throws CategoryInvalidaException {
        if (nombre == null || nombre.isBlank()) {
            throw new CategoryInvalidaException();
        }
    }
    
}
