import {EditProps, PreviewProps} from "@/interfaces/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import React from "react";
import {Tag, Image} from "lucide-react";
import {CategorySchemaDefinition, ICategory} from "@/server/models/Category";
import PreviewCategory from "@/app/(posts)/categories/preview";
import EditCategory from "@/app/(posts)/categories/edit";
import custom from "@/custom";
import {IPost, PostSchemaDefinition} from "@/server/models/Post";
import {IResume, ResumeSchemaDefinition} from "@/server/models/Resume";
import {IMedia, MediaSchemaDefinition} from "@/server/models/Media";

export interface ItemConfig<T extends IBaseItem> {
  api: string;
  schema: object;
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

interface CustomConfig<T extends IBaseItem> extends ItemConfig<T> {
  key: string;
}

export interface CustomConfigList {
  categories?: Partial<CustomConfig<ICategory>>[];
  posts?:  Partial<CustomConfig<IPost>>[];
  media?: Partial<CustomConfig<IMedia>>[];
  resumes?: Partial<CustomConfig<IResume>>[];
}

export interface ItemManifestList {
  categories: ItemConfig<ICategory>;
  posts: ItemConfig<IPost>;
  media: ItemConfig<IMedia>;
  resumes: ItemConfig<IResume>;
}

const ITEMS: ItemManifestList = {
  categories: {
    api: "/api/categories/category/",
    schema: CategorySchemaDefinition,
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
  media :{
    api: "/api/media/media/",
    schema: MediaSchemaDefinition,
    openEditInModal: true,
    queryFields: {
       title: "string",
    },
    names: {
      singular: "image",
      plural: "images"
    },
    icon: <Image/>,
    discriminators: (custom as CustomConfigList).media??[]
  },
  posts: {
    api: "/api/posts/post/",
    schema: PostSchemaDefinition,
    openEditInModal: true,
    discriminators: (custom as CustomConfigList).posts??[]
  },
  resumes: {
    api: "/api/resumes/",
    schema: ResumeSchemaDefinition,
    openEditInModal: true,
    discriminators: (custom as CustomConfigList).resumes??[]
  },
}

export const getConfig = (key: string) : ItemConfig<IBaseItem>=> {
    for (const [ikey, item] of Object.entries(ITEMS)) {
        if (ikey === key) {
            return item;
        }
        if (item.discriminators) {
          for (const discriminator of item.discriminators) {
            if (discriminator.key === key) {
              return {...item, ...discriminator};
            }
          }
        }
    }
    return ITEMS.categories;
}

export const getParentKey = (key: string) => {
  for (const [ikey, item] of Object.entries(ITEMS)) {
    if (ikey === key) {
      return ikey;
    } else {
      for (const discriminator of item.discriminators ?? []) {
        if (discriminator.key === key) {
          return ikey
        }
      }
    }
  }
  return "categories";
}

export const getAllPossibleKeys = (keys: string[]) => {
  const newKeys = [];
  for (const [ikey, item] of Object.entries(ITEMS)) {
    for (const discriminator of item.discriminators ?? []) {
      if (keys.includes(ikey)){
        newKeys.push(discriminator.key);
      }
    }
  }
  return newKeys;
}

export const getAllConfigsOfType = (key: string) : ItemConfig<IBaseItem>[] => {
  const configs: ItemConfig<IBaseItem>[] = [];
    for (const [ikey, item] of Object.entries(ITEMS)) {
        if (item.discriminators) {
          for (const discriminator of item.discriminators) {
            if (discriminator.key === key || ikey === key) {
              configs.push({...item, ...discriminator});
            }
          }
        }
    }
    return configs;
}

export default ITEMS