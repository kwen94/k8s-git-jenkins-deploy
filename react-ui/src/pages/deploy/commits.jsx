import React, { useState }  from 'react'
import PubSub from 'pubsub-js'
import { Table, Menu, Popover, message, Tag} from 'antd';
import { reqDeployCommitDetail } from '../../api/index'

import './commits.less'

const menu = (
    <Menu>
        <Menu.Item>Action 1</Menu.Item>
        <Menu.Item>Action 2</Menu.Item>
    </Menu>
);


function NestedTable() {
    
    let [isVisible, setVisible] = useState(false);
    let [tableData, setTableData] = useState([]);



    const getCommitInfo = async (serviceName, tag) => {
        const result = await reqDeployCommitDetail(serviceName, tag)
        if (result.code === 0) {
                setTableData(result.data)
        } else {
            message.error(`获取Tag列表失败: ${result.data.commits}`)
            setTableData([])
        }
    }

    React.useEffect(()=>{
        PubSub.subscribe('commitTableUpdate', (topic, data) => {
            if(data.tag!==undefined){
                getCommitInfo(data.serviceName, data.tag)
            } else {
                setTableData([])
            }
        })
    },[]);

    const splitDiff = (content) => {
        const data = []
        content.split("\n").forEach((v,i)=>{
        data.push(v);
        data.push(<br key={i}/>)
        });
        return data
    }

    const expandedRowRender = (value) => {
        const columns = [
            { 
                title: '序号', 
                dataIndex: 'num', 
                key: 'num', 
            },       
            { 
                title: '旧文件(鼠标悬停文件查看变更日志)', 
                dataIndex: 'old_file', 
                key: 'old_file' ,
                render: (text, record) => (
                <Popover visiable={isVisible} title={splitDiff(record.diff)}>
                {text}
                </Popover>) },
            {
                title: '新文件',
                key: 'new_file',
                dataIndex: 'new_file',
            },
            {
                title: '是否新增', 
                dataIndex: 'add', 
                key: 'add',
                render: (item) => (
                    item=="true"?<Tag color="red">是</Tag>:<Tag color="green">否</Tag>
                )
            },
            {
                title: '是否重命名',
                dataIndex: 'rename',
                key: 'rename',
                render: (item) => (
                    item=="true"?<Tag color="red">是</Tag>:<Tag color="green">否</Tag>
                )
            },
            { 
                title: '是否删除', 
                dataIndex: 'deleted', 
                key: 'deleted',
                render: (item) => (
                    item=="true"?<Tag color="red">是</Tag>:<Tag color="green">否</Tag>
                )
            },
        ];

        const data = []
        if(value){
            const diff = value.diff

            diff.map((d, index)=> {

                data.push({
                    key: index,
                    num: index + 1,
                    old_file: d.old_path,
                    new_file: d.new_path,
                    add: `${d.new_file}`,
                    rename: `${d.renamed_file}`,
                    deleted: `${d.deleted_file}`,
                    diff: d.diff,
                });
            })
        }

        return <Table columns={columns} rowKey="old_file" dataSource={data} pagination={false} />;
    };


const title = [];



    const columns = [
        { title: '提交ID', dataIndex: 'commit_id', key: 'commit_id',
        render: (item, record) => (
            <a href={record.link_url}>{item}</a>
        )

    },
        { title: '作者', dataIndex: 'author_name', key: 'author_name'
    },
        { title: '提交日志', dataIndex: 'title', key: 'title',
    },
        { title: '提交时间', dataIndex: 'committed_date', key: 'committed_date', 
    },
    ];

    return (
        <Table
            className="components-table-demo-nested"
            columns={columns}
            expandedRowRender={(value)=> {return expandedRowRender(value)}}
            dataSource={tableData.commits}
            rowKey="commit_id"
            onRow={record => {
                return {
                    onMouseEnter: event => {
                        setVisible(true)
                    }, // 鼠标移入行
                    onMouseLeave: event => {
                        setVisible(true)
                    },
                }
            }
            }
        />
    );
}

export default NestedTable