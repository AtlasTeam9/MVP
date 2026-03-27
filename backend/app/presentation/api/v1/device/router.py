import json
import re

from fastapi.responses import Response
from fastapi_utils.cbv import cbv
from fastapi_utils.inferring_router import InferringRouter

from app.presentation.api.v1.session.schema import DeviceSchema

router = InferringRouter(prefix="/device", tags=["device"])


@cbv(router)
class DeviceController:
    @router.post("/download_device", status_code=200)
    async def download_device(self, body: DeviceSchema) -> Response:
        device_payload = json.dumps(body.model_dump(), indent=2, ensure_ascii=False)
        safe_name = re.sub(r"[^a-zA-Z0-9_-]+", "_", body.device_name).strip("_") or "device"
        filename = f"{safe_name}.json"

        return Response(
            content=device_payload,
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )
