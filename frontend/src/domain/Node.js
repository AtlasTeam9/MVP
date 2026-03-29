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

    static fromApi(nodeId, nodeData = {}) {
        const rawType = nodeData.type
        const normalizedType =
            rawType === NodeType.RESULT || rawType === NodeType.QUESTION
                ? rawType
                : nodeData.result !== undefined
                    ? NodeType.RESULT
                    : NodeType.QUESTION

        return new Node(
            nodeId || nodeData.id || '',
            nodeData.text || nodeData.question || '',
            nodeData.description || null,
            normalizedType
        )
    }
}
