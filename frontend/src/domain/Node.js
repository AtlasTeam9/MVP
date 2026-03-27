export const NodeType = {
    QUESTION: 'QUESTION',
    RESULT: 'RESULT',
}

export class Node {
    constructor(id, text, description = null, type = NodeType.QUESTION) {
        this.id = id
        this.text = text
        this.description = description
        this.type = type
    }
}
