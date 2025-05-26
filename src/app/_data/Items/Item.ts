import { IBaseItem as ItemInterface } from "@/server/models/schemas/IBaseItem";
import {ItemService} from "@/app/_data/Items/ItemService";
import {makeAutoObservable} from "mobx";
import React from "react";
import {EditProps, PreviewProps} from "@/interfaces/data";
import {DataService} from "@/app/_data";

export class Item<T extends ItemInterface = ItemInterface> {
    private data: T;
    private readonly discriminatorType: string;
    readonly store: ItemService<T>;
    readonly edit?: React.FC<EditProps<T>>;
    readonly preview?: React.FC<PreviewProps<T>>;
    error: string | null = null;
    loading: boolean = false;
    warning: string | null = null;

    constructor(data: T, type?: string) {
        this.data = data;
        this.store = DataService.getService(type??(data as T)._t??"categories") as unknown as ItemService<T>;
        this.discriminatorType = (data as T)._t || type || "categories";
        this.edit = this.store.getEditElement(this.discriminatorType);
        this.preview = this.store.getPreviewElement(this.discriminatorType);
        makeAutoObservable(this);
    }

    setData(data: T) {
        this.data = data;
    }

    getData(): T {
        return this.data;
    }

    async save() {
        this.loading = true;
        const response = await this.store.updateItem(this.data)
        if (response.error){
            this.error = response.error;
        }
        if (response.warning){
            this.warning = response.warning;
        }
        this.loading = false;
    }

    async setDataAndSave(data: T) {
        this.data = data;
        await this.save();
    }

    async delete() {
        await this.store.deleteItem(this.data);
    }

}