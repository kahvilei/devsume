import React from "react";
import { EditProps, PreviewProps } from "@/interfaces/data";
import { IBaseItem as ItemInterface } from "@/server/models/schemas/IBaseItem";
import { getConfig } from "@/config/items";

export class Item<T extends ItemInterface = ItemInterface> {
    private data: T;
    private readonly discriminatorType: string;

    constructor(data: T) {
        this.data = data;
        // Extract discriminator type from _t field, fallback to parent type
        this.discriminatorType = (data as T)._t || this.inferParentType();
    }

    // Infer parent type from API path if _t is not available
    private inferParentType(): string {
        // This would be set by the service when creating the item
        return 'categories'; // fallback
    }

    // Get the configuration for this item's type
    private getConfig() {
        return getConfig(this.discriminatorType);
    }

    // Get raw data
    getData(): T {
        return this.data;
    }

    // Get discriminator type
    getType(): string {
        return this.discriminatorType;
    }

    // Update raw data
    updateData(data: Partial<T>): void {
        this.data = { ...this.data, ...data };
    }

    // Get the preview component for this item type
    getPreviewComponent(): React.FC<PreviewProps<T>> | undefined {
        const config = this.getConfig();
        return config.preview as unknown as React.FC<PreviewProps<T>>;
    }

    // Get the edit component for this item type
    getEditComponent(): React.FC<EditProps<T>> | undefined {
        const config = this.getConfig();
        return config.edit as unknown as React.FC<EditProps<T>>;
    }

    // Get display name for this item type
    getDisplayName(plural = false): string {
        const config = this.getConfig();
        if (config.names) {
            return plural ? config.names.plural : config.names.singular;
        }
        return this.discriminatorType;
    }

    // Get icon for this item type
    getIcon(): React.ReactNode {
        const config = this.getConfig();
        return config.icon;
    }

    // Check if should open in modal
    shouldOpenInModal(): boolean {
        const config = this.getConfig();
        return config.openEditInModal || false;
    }

    // Get API endpoint for this specific item type
    getApiEndpoint(): string {
        const config = this.getConfig();
        return config.api;
    }

    // Utility method to get ID
    getId(): string {
        return this.data._id || '';
    }

    // Utility method to get slug
    getSlug(): string {
        return (this.data as T).slug || '';
    }
}