import PreviewTag from "@/custom/categories/skills/preview";
import EditTag from "@/custom/categories/skills/edit";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";
import React from "react";
import mongoose from "mongoose";
import {Tag} from "lucide-react";

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
}

export interface ItemManifestList {
  [key: string]: ItemConfig<any>
}

const ITEMS: ItemManifestList = {
  categories: {
    api: "/api/categories/",
    preview: PreviewTag as React.FC<PreviewProps<ITag>>,
    edit: EditTag as React.FC<EditProps<ITag>>,
    openEditInModal: false,
    queryFields: {
      title: "string",
      tags: "string"
    },
    names: {
      singular: "category",
      plural: "categories"
    },
    icon: <Tag/>
  },
  posts: {
    api: "/api/posts/",
    openEditInModal: true
  },
  resumes: {
    api: "/api/resumes/",
    openEditInModal: true
  },
}

export default ITEMS