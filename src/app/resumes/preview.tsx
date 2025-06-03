import {IResume} from "@/server/models/Resume";
import {PreviewProps} from "@/interfaces/data";


export default function PreviewResume({item}: PreviewProps<IResume>) {
    const resume = item.getData();

    return (
        <div className="resume">
            <section className="right">
                <section className="title-description">
                    <h3 className="title">{resume.title}</h3>
                </section>
            </section>
        </div>
    )
}

