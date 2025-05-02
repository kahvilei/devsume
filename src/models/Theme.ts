import mongoose from 'mongoose';

const ThemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    colors: {
        primary: { type: String, required: true },
        secondary: { type: String, required: true },
        tertiary: { type: String },
        foreground: { type: String, required: true }, // Base color for border, text, etc.
        background: { type: String, required: true }
    },
    radius: { type: String, default: '0.5rem' }, // Default border radius
    typography: {
        body: {
            font: { type: String, required: true },
            size: { type: String, default: '16px' },
            weight: { type: String, default: '400' },
            style: { type: String, default: 'normal' },
            color: { type: String }
        },
        headings: {
            font: { type: String, required: true },
            h1: {
                size: { type: String, default: '2.5rem' },
                weight: { type: String, default: '700' },
                style: { type: String, default: 'normal' },
                color: { type: String }
            }
            // Can add h2, h3, etc. as needed
        }
    },
    components: {
        buttons: {
            // Button styling properties
            borderRadius: { type: String },
            padding: { type: String },
            backgroundColor: { type: String },
            textColor: { type: String },
            hoverColor: { type: String }
        },
        images: {
            // Image styling properties
            borderRadius: { type: String },
            boxShadow: { type: String }
        }
    }
});

export default mongoose.models.Theme || mongoose.model('Theme', ThemeSchema);