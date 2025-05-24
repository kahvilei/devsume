// Utility function to create common reference configurations
import {AutoReferenceConfig} from "@/lib/models/plugins/withAutoRef";

export const createReferenceConfig = {
    /**
     * Creates a reference config for User fields
     */
    user: (options: Partial<AutoReferenceConfig[string]> = {}): AutoReferenceConfig[string] => ({
        model: 'User',
        autoPopulate: false,
        populateSelect: 'name email',
        ...options
    }),

    /**
     * Creates a reference config for Media fields
     */
    media: (options: Partial<AutoReferenceConfig[string]> = {}): AutoReferenceConfig[string] => ({
        model: 'Media',
        autoPopulate: false,
        populateSelect: 'filename url alt caption mimetype size',
        ...options
    }),

    /**
     * Creates a reference config for Category fields
     */
    category: (options: Partial<AutoReferenceConfig[string]> = {}): AutoReferenceConfig[string] => ({
        model: 'Category',
        autoPopulate: false,
        populateSelect: 'title slug',
        ...options
    }),

    /**
     * Creates a reference config for Post fields
     */
    post: (options: Partial<AutoReferenceConfig[string]> = {}): AutoReferenceConfig[string] => ({
        model: 'Post',
        autoPopulate: false,
        populateSelect: 'title slug excerpt publishedAt',
        ...options
    }),

    /**
     * Creates a reference config for Resume fields
     */
    resume: (options: Partial<AutoReferenceConfig[string]> = {}): AutoReferenceConfig[string] => ({
        model: 'Resume',
        autoPopulate: false,
        populateSelect: 'name subtitle',
        ...options
    })
};