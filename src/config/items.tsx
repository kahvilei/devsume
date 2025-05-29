import {EditProps, PreviewProps} from "@/interfaces/data";
import {IBaseItem} from "@/server/models/schemas/IBaseItem";
import React from "react";
import {Tag, Image} from "lucide-react";

import PreviewCategory from "@/app/(posts)/categories/preview";
import EditCategory from "@/app/(posts)/categories/edit";
import custom from "@/custom";

import {IPost} from "@/server/models/Post";
import {IResume} from "@/server/models/Resume";
import {IMedia} from "@/server/models/Media";
import {ICategory} from "@/server/models/Category";
import {IImage} from "@/custom/media/image/model";
import PreviewImage from "@/app/media/preview";
import EditImage from "@/app/media/edit";

export interface ItemConfig<T extends IBaseItem> {
  api: string;
  key: string;
  preview?: React.FC<PreviewProps<T>>;
  edit?: React.FC<EditProps<T>>;
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
    key: "Category",
    api: "/api/categories/",
    preview: PreviewCategory as React.FC<PreviewProps<ICategory>>,
    edit: EditCategory as React.FC<EditProps<ICategory>>,
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
    key: "Media",
    api: "/api/media/",
    preview: PreviewImage as React.FC<PreviewProps<IImage>>,
    edit: EditImage as React.FC<EditProps<IImage>>,
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
    key: "Post",
    api: "/api/posts/",
    discriminators: (custom as CustomConfigList).posts??[]
  },
  resumes: {
    key: "Resume",
    api: "/api/resumes/",
    discriminators: (custom as CustomConfigList).resumes??[]
  },
}

export default ITEMS