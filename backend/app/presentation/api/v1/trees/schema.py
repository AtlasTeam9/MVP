from pydantic import BaseModel, Field


class GetTreesSchema(BaseModel):
    id: str = Field(..., description="Id dell'albero")
    title: str = Field(..., description="Titolo dell'albero")
    dependencies: list[str] = Field(..., description="Dipendenze dell'albero")
    nodes: dict = Field(..., description="Nodi dell'albero")
