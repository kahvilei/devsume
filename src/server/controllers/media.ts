import {createMediaController} from "@/lib/api/media-controller-factory";
import service from "@/server/actions/media";

const mediaController = createMediaController(service);

export default mediaController;