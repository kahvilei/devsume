import PreviewTag from "@/app/(posts)/(categories)/tags/preview";
import EditTag from "@/app/(posts)/(categories)/tags/edit";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";
import React from "react";
import {ITag} from "@/models/categories/Tag";
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
  tags: {
    api: "/api/tags/",
    preview: PreviewTag as React.FC<PreviewProps<ITag>>,
    edit: EditTag as React.FC<EditProps<ITag>>,
    openEditInModal: false,
    queryFields: {
      title: "string",
      description: "string"
    },
    names: {
      singular: "tag",
      plural: "tags"
    },
    icon: <Tag/>
  },
  people: {
    api: "/api/people/",
    openEditInModal: false
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