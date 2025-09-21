import { defineStore } from 'pinia';
import { produce, original } from 'immer';
import { StringExt } from '@antv/x6';

const COMMANDS = {
  INIT: 'init',
  ADD_NODES: 'addNodes',
  REMOVE_NODES: 'removeNodes',
  UPDATE_NODE: 'updateNode',
  ADD_EDGES: 'addEdges',
  REMOVE_EDGES: 'removeEdges',
  UPDATE_EDGE: 'updateEdge'
};

/**
 * XFlow 图数据状态管理 Store
 */
export const useXFlowStore = defineStore('xflow', {
  state: () => ({
    // 图实例
    graph: null,
    // 节点数据
    nodes: [],
    // 边数据
    edges: [],
    // 变更记录列表
    changeList: []
  }),

  getters: {
    // 获取所有节点
    allNodes: (state) => state.nodes,
    
    // 获取所有边
    allEdges: (state) => state.edges,
    
    // 根据ID获取节点
    getNodeById: (state) => (id) => {
      return state.nodes.find(node => node.id === id);
    },
    
    // 根据ID获取边
    getEdgeById: (state) => (id) => {
      return state.edges.find(edge => edge.id === id);
    },
    
    // 获取变更历史
    getChangeList: (state) => state.changeList
  },

  actions: {
    // 设置图实例
    setGraph(graph) {
      this.graph = graph;
    },

    // 初始化数据
    initData(data, options = {}) {
      this.nodes = data.nodes || [];
      this.edges = data.edges || [];
      
      if (!options.silent) {
        this.changeList.push({
          command: COMMANDS.INIT,
          data
        });
      }
    },

    // 添加节点
    addNodes(nodes, options = {}) {
      if (!nodes.length) return;
      
      // 为没有ID的节点生成ID
      nodes.forEach(node => {
        if (!node.id) {
          node.id = StringExt.uuid();
        }
      });
      
      // 检查重复ID
      const duplicated = this.nodes.find(existingNode =>
        nodes.some(newNode => newNode.id === existingNode.id)
      );
      
      if (!duplicated) {
        this.nodes.push(...nodes);
        
        if (!options.silent) {
          this.changeList.push({
            command: COMMANDS.ADD_NODES,
            data: nodes
          });
        }
      } else {
        console.error(`节点 id=${duplicated.id} 已存在`);
      }
    },

    // 删除节点
    removeNodes(ids, options = {}) {
      if (!ids.length) return;
      
      const removedNodes = [];
      this.nodes = this.nodes.filter(node => {
        if (ids.includes(node.id)) {
          removedNodes.push(node);
          return false;
        }
        return true;
      });
      
      if (!options.silent && removedNodes.length) {
        this.changeList.push({
          command: COMMANDS.REMOVE_NODES,
          data: removedNodes
        });
      }
    },

    // 更新节点
    updateNode(id, updateData, options = {}) {
      const nodeIndex = this.nodes.findIndex(node => node.id === id);
      if (nodeIndex === -1) {
        console.error(`节点 id=${id} 不存在`);
        return;
      }
      
      const oldNode = { ...this.nodes[nodeIndex] };
      const newData = typeof updateData === 'function' 
        ? updateData(oldNode) 
        : updateData;
      
      this.nodes[nodeIndex] = { ...oldNode, ...newData };
      
      if (!options.silent) {
        this.changeList.push({
          command: COMMANDS.UPDATE_NODE,
          data: { id, oldData: oldNode, newData }
        });
      }
    },

    // 添加边
    addEdges(edges, options = {}) {
      if (!edges.length) return;
      
      // 为没有ID的边生成ID
      edges.forEach(edge => {
        if (!edge.id) {
          edge.id = StringExt.uuid();
        }
      });
      
      // 检查重复ID
      const duplicated = this.edges.find(existingEdge =>
        edges.some(newEdge => newEdge.id === existingEdge.id)
      );
      
      if (!duplicated) {
        this.edges.push(...edges);
        
        if (!options.silent) {
          this.changeList.push({
            command: COMMANDS.ADD_EDGES,
            data: edges
          });
        }
      } else {
        console.error(`边 id=${duplicated.id} 已存在`);
      }
    },

    // 删除边
    removeEdges(ids, options = {}) {
      if (!ids.length) return;
      
      const removedEdges = [];
      this.edges = this.edges.filter(edge => {
        if (ids.includes(edge.id)) {
          removedEdges.push(edge);
          return false;
        }
        return true;
      });
      
      if (!options.silent && removedEdges.length) {
        this.changeList.push({
          command: COMMANDS.REMOVE_EDGES,
          data: removedEdges
        });
      }
    },

    // 更新边
    updateEdge(id, updateData, options = {}) {
      const edgeIndex = this.edges.findIndex(edge => edge.id === id);
      if (edgeIndex === -1) {
        console.error(`边 id=${id} 不存在`);
        return;
      }
      
      const oldEdge = { ...this.edges[edgeIndex] };
      const newData = typeof updateData === 'function' 
        ? updateData(oldEdge) 
        : updateData;
      
      this.edges[edgeIndex] = { ...oldEdge, ...newData };
      
      if (!options.silent) {
        this.changeList.push({
          command: COMMANDS.UPDATE_EDGE,
          data: { id, oldData: oldEdge, newData }
        });
      }
    },

    // 清空变更记录
    clearChangeList() {
      this.changeList = [];
    },

    // 重置所有状态
    reset() {
      this.graph = null;
      this.nodes = [];
      this.edges = [];
      this.changeList = [];
    }
  }
});