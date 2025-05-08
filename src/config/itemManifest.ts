import PreviewTag from "@/app/tags/preview";
import EditTag from "@/app/tags/edit";
import {BaseDataModel, EditProps, PreviewProps} from "@/interfaces/data";
import React from "react";
import {ITag} from "@/models/categories/Tag";

export interface ItemManifest<T extends BaseDataModel = BaseDataModel> {
  api: string;
  preview?: React.FC<PreviewProps<T>>;
  edit?: React.FC<EditProps<T>>;
  openEditInModal?: boolean;
}

export interface ItemManifestList {
  [key: string]: ItemManifest<any>
}

const ITEMS: ItemManifestList = {
  tags: {
    api: "/api/tags/",
    preview: PreviewTag as React.FC<PreviewProps<ITag>>,
    edit: EditTag as React.FC<EditProps<ITag>>,
    openEditInModal: true
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