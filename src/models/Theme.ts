import mongoose from 'mongoose';

const Heading = {
    size: { type: String },
    weight: { type: String },
    style: { type: String },
    color: { type: String }
}

const ThemeSchema = new mongoose.Schema({
    name: { type: String },
    colors: {
        primary: { type: String },
        secondary: { type: String },
        tertiary: { type: String },
        foreground: { type: String }, // Base color for borders, text, etc.
        background: { type: String }
    },
    radius: { type: String }, // Default border radius
    typography: {
        body: {
            font: { type: String },
            size: { type: String },
            weight: { type: String },
            style: { type: String },
            color: { type: String }
        },
        headings: {
            font: { type: String },
            h1: Heading,
            h2: Heading,
            h3: Heading,
            h4: Heading,
            h5: Heading,
            h6: Heading,
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