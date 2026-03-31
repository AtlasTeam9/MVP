import { Node } from './Node'

export class DecisionTree {
    constructor(id, title, nodes = {}, dependencies = []) {
        this.id = id
        this.title = title
        this.nodes = nodes
        this.dependencies = dependencies
    }

    getNodeById(nodeId) {
        return this.nodes?.[nodeId] || null
    }

    static fromApi(treeData = {}) {
        const mappedNodes = Object.entries(treeData.nodes || {}).reduce(
            (accumulator, [nodeId, nodeData]) => {
                accumulator[nodeId] = Node.fromApi(nodeId, nodeData)
                return accumulator
            },
            {}
        )

        return new DecisionTree(
            treeData.id || treeData.requirement_id || '',
            treeData.title || treeData.name || '',
            mappedNodes,
            Array.isArray(treeData.dependencies) ? treeData.dependencies : []
        )
    }
}
