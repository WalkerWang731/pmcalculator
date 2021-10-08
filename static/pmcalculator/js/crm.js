function CRM(){
	this.crm_list = [];
	this.data = [];
	this.links = [];
	this.node_weight = {};
	this.add_data = _add_data;
	this.base_location = 100;
	this.generate_graph = _generate_graph;
	this.get_node_data_info = _get_node_data_info;
	this.get_node_links_info = _get_node_links_info;
	this.generate_target_node = _generate_target_node;
	this.calculate_path = _calculate_path;
	
	this.bigest = {
		'x': 0,
		'y': 0
	}
	
}


// 获取node data信息
function _get_node_data_info(node_name){
	for (var i in this.data){
		if (this.data[i]['name'] === node_name){
			return this.data[i]
		}
	}
	return null
}

// 获取node links信息
function _get_node_links_info(node_name){
	var _links = [];
	for (var i in this.links){
		if (this.links[i]['source'] === node_name){
			_links.push(this.links[i])
		}
	}
	return _links
}

// 生成node的坐标系
function _generate_target_node(source, target, term){
	var source_node_info = this.get_node_data_info(source);
	var target_node_info = this.get_node_data_info(target);
	
	if (target_node_info !== null){
		return target_node_info
	}
	
	target_node_info = {
		'name': target,
		'x': this.base_location,
		'y': this.base_location,
		'value': '1, 3'
	}
	
	if (source_node_info !== null){
		var _links = this.get_node_links_info(source);
		target_node_info['x'] = this.bigest['x'] + this.base_location;
		target_node_info['y'] = source_node_info['y'] + source_node_info['y'] * _links.length;
		
		if(source_node_info['y'] == target_node_info['y']){
			var campare_y = target_node_info['y']
			var _flag = false;
			for(var i in this.data){
				if(this.data[i]['name'] == source_node_info['name']){
					_flag = true
					continue
				}
				if(this.data[i]['name'] == target_node_info['name']){
					_flag = false
					
					continue
				}
				if(_flag == true){
					if(this.data[i]['y'] == campare_y && this.data[i]['x'] < target_node_info['x']){
						campare_y += this.base_location
					}
				}
			}
			
			if(campare_y !== target_node_info['y']){
				target_node_info['y'] = campare_y
				for(var i in this.data){
					if(this.data[i]['name'] == source_node_info['name']){
						this.data[i]['y'] = campare_y
						break
					}
				}
			}
		}
	}
	
	this.data.push(target_node_info);
	this.bigest['x'] = target_node_info['x'];
	this.bigest['y'] = target_node_info['y'];
	this.node_weight[target] = [0, 0]
	
	return target_node_info
}

function _add_data(source, target, term){
	this.crm_list.push([source, target, term])
}


// function generate_graph()
/*
        生成网络图带坐标系
        Node 坐标系
        data: [
            {
              name: 'Node 1',
              x: 100,
              y: 100
            },
            {
              name: 'Node 2',
              x: 800,
              y: 300
            },
            {
              name: 'Node 3',
              x: 550,
              y: 100
            },
            {
              name: 'Node 4',
              x: 550,
              y: 500
            }
        ]

        连接箭头
        links: [
            {
              source: 'Node 1',
              target: 'Node 3',
                lineStyle: {
                width: 10
              }
            },
            {
              source: 'Node 2',
              target: 'Node 3'
            },
            {
              source: 'Node 2',
              target: 'Node 4'
            },
            {
              source: 'Node 1',
              target: 'Node 4'
            }
        ]
*/
function _generate_graph(){
	var _crm_list = this.crm_list
	// 排序
	this.crm_list.sort(function(x,y){
		 return x[1].charCodeAt(0) - y[1].charCodeAt(0)
	})
	this.crm_list.sort(function(x,y){
		 return x[0].charCodeAt(0) - y[0].charCodeAt(0)
	})
	
	for(var i in _crm_list){
		if(i == 0){
			this.generate_target_node(_crm_list[i][0], _crm_list[i][0], 0)
		}
		this.generate_target_node(_crm_list[i][0], _crm_list[i][1], _crm_list[i][2])
		this.links.push({
			'source': _crm_list[i][0],
			'target': _crm_list[i][1],
			'private': {
				'trem': _crm_list[i][2],
				'iskey': false
			}
		})
	}
	
	this.calculate_path()
	
}



function _calculate_path(){
	// 正向计算最大的节点
	for(var i in this.links){
		if(this.node_weight[this.links[i]['target']][0] == 0){
			this.node_weight[this.links[i]['target']][0] = this.node_weight[this.links[i]['source']][0] + this.links[i]['private']['trem']
			continue
		}
		if(this.node_weight[this.links[i]['source']][0] + this.links[i]['private']['trem'] > this.node_weight[this.links[i]['target']][0]){
			this.node_weight[this.links[i]['target']][0] = this.node_weight[this.links[i]['source']][0] + this.links[i]['private']['trem']
		}
	}
	
	
	// 反向计算最小节点
	this.links.reverse()
	for (var i in this.links){
		if(i == 0){
			this.node_weight[this.links[i]['target']][1] = this.node_weight[this.links[i]['target']][0]
		}
		if(this.node_weight[this.links[i]['source']][1] == 0){
			this.node_weight[this.links[i]['source']][1] = this.node_weight[this.links[i]['target']][1] - this.links[i]['private']['trem']
			continue
		}
		if(this.node_weight[this.links[i]['target']][1] - this.links[i]['private']['trem'] < this.node_weight[this.links[i]['source']][1]){
			this.node_weight[this.links[i]['source']][1] = this.node_weight[this.links[i]['target']][1] - this.links[i]['private']['trem']
		}
	}
	this.links.reverse()
		
		
	// 计算关键路径
	for (var i in this.links){
		if(this.node_weight[this.links[i]['source']][0] == this.node_weight[this.links[i]['source']][1] && 
		this.node_weight[this.links[i]['target']][0] == this.node_weight[this.links[i]['target']][1]){
			this.links[i]['lineStyle'] = {
				'width': 3,
				'color': 'red',
			}
			this.links[i]['private']['iskey'] = true
		}
		
	}
	
	
	// 赋值给每个节点
	for(var i in this.data){
		this.data[i]['value'] = this.node_weight[this.data[i]['name']].join(', ')
	}
}