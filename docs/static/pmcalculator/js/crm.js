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
	this.convert_num = _convert_num;
	this.get_target_num = _get_target_num;
	
	this.to_fixed_count = 0; 	// 默认小数精度
	
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
		if (target_node_info['x'] <= source_node_info['x']){
			for (var i in this.data){
				if (this.data[i]['name'] === target_node_info['name']){
					this.data[i]['x'] = this.bigest['x'] + this.base_location
					target_node_info = this.data[i];
					break;
				}
			}
			
		}
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
		target_node_info['x'] = this.bigest['x'] + this.base_location + (this.base_location * this.get_target_num(target));
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
			'lineStyle': {
					'width': 1,
					'color': 'black',
			},
			'private': {
				'term': _crm_list[i][2],
				'iskey': false,
				'origin_data': _crm_list[i],
				'index': i,
			}
		})
	}
	
	this.calculate_path()
	
}

function _convert_num(num){
	if(this.to_fixed_count == 0){
		var _n = parseInt(num.toFixed(this.to_fixed_count))
	}else{
		var _n = parseFloat(num.toFixed(this.to_fixed_count))
	}
	return _n
}



function _calculate_path(){
	// 正向计算最大的节点
	for(var i in this.links){
		if(this.node_weight[this.links[i]['target']][0] == 0){
			this.node_weight[this.links[i]['target']][0] = this.node_weight[this.links[i]['source']][0] + this.links[i]['private']['term']
			this.node_weight[this.links[i]['target']][0] = this.convert_num(this.node_weight[this.links[i]['target']][0])
			continue
		}
		if(this.node_weight[this.links[i]['source']][0] + this.links[i]['private']['term'] > this.node_weight[this.links[i]['target']][0]){
			this.node_weight[this.links[i]['target']][0] = this.node_weight[this.links[i]['source']][0] + this.links[i]['private']['term']
			this.node_weight[this.links[i]['target']][0] = this.convert_num(this.node_weight[this.links[i]['target']][0])
		}
	}
	
	
	// 反向计算最小节点
	this.links.reverse()
	for (var i in this.links){
		if(i == 0){
			this.node_weight[this.links[i]['target']][1] = this.node_weight[this.links[i]['target']][0]
		}
		if(this.node_weight[this.links[i]['source']][1] == 0){
			this.node_weight[this.links[i]['source']][1] = this.node_weight[this.links[i]['target']][1] - this.links[i]['private']['term']
			this.node_weight[this.links[i]['source']][1] = this.convert_num(this.node_weight[this.links[i]['source']][1])
			continue
		}
		if(this.node_weight[this.links[i]['target']][1] - this.links[i]['private']['term'] < this.node_weight[this.links[i]['source']][1]){
			this.node_weight[this.links[i]['source']][1] = this.node_weight[this.links[i]['target']][1] - this.links[i]['private']['term']
			this.node_weight[this.links[i]['source']][1] = this.convert_num(this.node_weight[this.links[i]['source']][1])
		}
	}
	this.links.reverse()
		
		
	// 计算关键路径
	var key_path_target = {};
	
	for (var i in this.links){
		if(this.node_weight[this.links[i]['source']][0] == this.node_weight[this.links[i]['source']][1] && 
		this.node_weight[this.links[i]['target']][0] == this.node_weight[this.links[i]['target']][1]){
			
			if(this.links[i]['target'] in key_path_target){
				var _target_weight = this.node_weight[this.links[i]['target']][0]
				var _previous_path_index = key_path_target[this.links[i]['target']]
				var _previous_source_weight = this.node_weight[this.links[_previous_path_index]['source']][0]
				var _current_source_weight = this.node_weight[this.links[i]['source']][0]
				console.log(this.links[i], _target_weight, _previous_source_weight, _current_source_weight)
				if(_target_weight - _current_source_weight < _target_weight - _previous_source_weight){
					
					this.links[_previous_path_index]['lineStyle']['width'] = 1
					this.links[_previous_path_index]['lineStyle']['color'] = 'black'
					this.links[_previous_path_index]['private']['iskey'] = false
					
					this.links[i]['lineStyle']['width'] = 3
					this.links[i]['lineStyle']['color'] = 'red'
					this.links[i]['private']['iskey'] = true
					
					key_path_target[this.links[i]['target']] = i
				}
			}else{
				this.links[i]['lineStyle']['width'] = 3
				this.links[i]['lineStyle']['color'] = 'red'
				this.links[i]['private']['iskey'] = true
				key_path_target[this.links[i]['target']] = i
				}
				
			}
			
	}
	
	
	// 赋值给每个节点
	for(var i in this.data){
		this.data[i]['value'] = this.node_weight[this.data[i]['name']].join(', ')
	}
}


function _get_target_num(target){
	var count = 0;
	for (var i in this.crm_list){
		if (target === this.crm_list[i][1]){
			count += 1;
		}
	}
	return count
}