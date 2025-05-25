import { DataService } from "./ServiceStore";

// Export the unified DataService that handles all models and their discriminators
export { DataService };

// Example usage:

// Fetch all categories (includes skills, collaborators, etc.)
// const allCategories = await DataService.categories.getQueryResult('/api/categories/category/');

// Fetch only skills using the discriminator key
// const skills = await DataService.fetchByType('skill', { title: 'JavaScript' });

// Create a new skill
// const newSkill = await DataService.createByType('skill', {
//     title: 'React',
//     description: 'Frontend framework',
//     tags: ['frontend', 'javascript']
// });

// Update an existing skill
// const updatedSkill = await DataService.updateByType('skill', {
//     _id: '123',
//     title: 'React.js',
//     description: 'Updated description'
// });

// Delete a skill
// const deleted = await DataService.deleteByType('skill', { _id: '123' });

// Get an item instance to access its methods
// const itemInstance = DataService.getItemInstanceById('123');
// if (itemInstance) {
//     const PreviewComponent = itemInstance.getPreviewComponent();
//     const EditComponent = itemInstance.getEditComponent();
//     const displayName = itemInstance.getDisplayName();
// }

// Direct service access for parent-level operations
// const categoryService = DataService.categories;
// const allCategoriesResult = await categoryService.getQueryResult('/api/categories/category/', '?sort=title');

// Check loading state
// if (DataService.isLoading) {
//     // Show loading indicator
// }

// Check for errors
// const errors = DataService.errors;
// if (errors.categories) {
//     console.error('Category service error:', errors.categories);
// }