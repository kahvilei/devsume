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
  discriminators?: ItemConfig<T>[];
}

export interface CustomConfig {
  categories?: ItemConfig<ICategory>[];
  posts?: ItemConfig<IPost>[];
  resumes?: ItemConfig<IResume>[];
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
    discriminators: (custom as CustomConfig).categories??[]
  },
  posts: {
    api: "/api/posts/",
    openEditInModal: true,
    discriminators: (custom as CustomConfig).posts??[]
  },
  resumes: {
    api: "/api/resumes/",
    openEditInModal: true,
    discriminators: (custom as CustomConfig).resumes??[]
  },
}

export default ITEMS