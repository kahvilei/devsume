import { ITag } from "@/models/categories/Tag";
import {PreviewProps} from "@/interfaces/data";

export default function PreviewTag({
      item: tag,
  }: PreviewProps<ITag>) {
    return (
        <div
            key={tag.title}
            aria-label={tag.title}
            className="flex items-center justify-between tag-selector tag cursor-pointer"
        >
            <div className="flex items-center">
                <span className="mr-2">{tag.title}</span>
                <span className="mr-2">{tag.description}</span>
            </div>
        </div>
    );
}
