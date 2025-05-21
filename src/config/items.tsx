import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";
import React from "react";
import mongoose from "mongoose";
import {Tag} from "lucide-react";
import {ICategory} from "@/models/Category";
import PreviewCategory from "@/app/(posts)/categories/preview";
import EditCategory from "@/app/(posts)/categories/edit";
import custom from "@/custom";
import {IPost} from "@/models/Post";
import {IResume} from "@/models/Resume";

export interface ItemConfig<T extends BaseDataModel> {
  api: string;
  model?: mongoose.Model<T>;
  preview?: React.FC<PreviewProps<T>>;
  edit?: React.FC<EditProps<T>>;
  openEditInModal?: boolean;
  queryFields?: {
    [key: string]: string
  }
  names?: {
    singular: string;
    plural: string;
  }
  icon?: React.ReactNode;
  discriminators?: Partial<CustomConfig<T>>[];
}

interface CustomConfig<T extends BaseDataModel> extends ItemConfig<T> {
  key: string;
}

export interface CustomConfigList {
  categories?: Partial<CustomConfig<ICategory>>[];
  posts?:  Partial<CustomConfig<IPost>>[];
  resumes?: Partial<CustomConfig<IResume>>[];
}

export interface ItemManifestList {
  categories: ItemConfig<ICategory>;
  posts: ItemConfig<IPost>;
  resumes: ItemConfig<IResume>;
}

const ITEMS: ItemManifestList = {
  categories: {
    api: "/api/categories/",
    preview: PreviewCategory as React.FC<PreviewProps<ICategory>>,
    edit: EditCategory as React.FC<EditProps<ICategory>>,
    openEditInModal: false,
    queryFields: {
      title: "string",
      tags: "string"
    },
    names: {
      singular: "category",
      plural: "categories"
    },
    icon: <Tag/>,
    discriminators: (custom as CustomConfigList).categories??[]
  },
  posts: {
    api: "/api/posts/",
    openEditInModal: true,
    discriminators: (custom as CustomConfigList).posts??[]
  },
  resumes: {
    api: "/api/resumes/",
    openEditInModal: true,
    discriminators: (custom as CustomConfigList).resumes??[]
  },
}

export const getConfig = (key: string) : ItemConfig<any>=> {
    for (const item of Object.values(ITEMS)) {
        if (item.key === key) {
            return item;
        } else if (item.discriminators) {
          for (const discriminator of item.discriminators) {
            if (discriminator.key === key) {
              return {...item, ...discriminator};
            }
          }
        }
    }
    return ITEMS.categories;
}

export const getAllConfigsOfType = (key: string) : ItemConfig<any>[] => {
  const configs: ItemConfig<any>[] = [];
    for (const item of Object.values(ITEMS)) {
        if (item.key === key) {
            configs.push(item);
        }
        if (item.discriminators) {
          for (const discriminator of item.discriminators) {
            if (discriminator.key === key || item.key === key) {
              configs.push({...item, ...discriminator});
            }
          }
        }
    }
    return configs;
}

export default ITEMS