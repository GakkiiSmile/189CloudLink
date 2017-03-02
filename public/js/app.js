var CloudLink = React.createClass({
    getInitialState: function() {
        return {
            folderId: 0,//当前目录id
            folderArray: [], //记录当前目录的数组
            isLoading: false,//是否在加载
            isError: false,//是否出现错误
            noAccessToken: false,

            filesList : [], //获取前页存放的数据数组
            totalNum:'',//总记录数
            totalData:{},//取得的全部数据
            current: 1, //当前页码
            pageSize:8, //每页显示的条数5条
            goValue:'',
            totalPage:'',//总页数
        };
    },
    componentWillMount: function() {
        this.load();
    },
    load: function() {
        var temp = [];
        this.setState({isLoading: true,isError: false});
        $.getJSON(this.state.folderId == 0 ? '/admin/folder/': '/admin/folder/' + this.state.folderId, function(data){
            this.setState({isLoading: false});
            if(data.error){
                this.setState({filesList: [],totalData:{},current: 1,totalNum:'',totalPage:'',isError: true});
                return;
            }
            if(data.noAccessToken == 'true'){
                this.setState({filesList: [],totalData:{},current: 1,totalNum:'',totalPage:'',noAccessToken: true});
                return;
            }
            if(this.state.folderId != 0){
                temp.push({
                    name: '..',
                    id  : this.state.lastFolder,
                    folder: true,
                });
            }
            if(data.listFiles.fileList[0].folder != undefined)
                data.listFiles.fileList[0].folder.map(function(foldersItem){
                    foldersItem.folder = true;
                    temp.push(foldersItem);
                });
            if(data.listFiles.fileList[0].file != undefined)
                data.listFiles.fileList[0].file.map(function(filesItem){
                    filesItem.folder = false;
                    temp.push(filesItem);
                });
            this.setState({totalData:temp,totalNum: temp.length})
            //计算总页数= 总记录数 / 每页显示的条数
            let totalPage =Math.ceil( this.state.totalNum / this.state.pageSize);
            this.setState({totalPage:totalPage})
            this.pageClick(1);
            this.setState({isError: false,noAccessToken: false});
        }.bind(this));
    },
    toFolder: function(folderId, folderName){
        if(folderName == '..'){
            var top = this.state.folderArray.pop();
            this.state.folderId = this.state.folderArray.length + 1 == 1 ? 0 : top;
            // console.log(this.state.folderArray.length + 1 == 1 ? 0 : top);
        }else{
            this.state.folderArray.push(this.state.folderId);
            this.state.folderId = folderId;
        }
        this.setState({filesList: []});
        this.load();
    },
    //点击翻页
    pageClick: function(pageNum){
            let _this = this;
           if(pageNum != _this.state.current){
               _this.state.current = pageNum
           }
           _this.state.filesList=[];//清空之前的数据
           for(var i = (pageNum - 1) * _this.state.pageSize; i< _this.state.pageSize * pageNum; i++){
               if(_this.state.totalData[i]){
                   _this.state.filesList.push(_this.state.totalData[i])
               }
           }
           _this.setState({filesList:_this.state.filesList})
           //console.log(_this.state.filesList)
    },
    goIndex: function(){
        var _this = this;
        let cur = this.state.current;
        if(cur != 1){
            _this.pageClick(1);
        }
    },
    //上一步
    goPrevClick: function(){
        var _this = this;
        let cur = this.state.current;
        if(cur > 1){
            _this.pageClick( cur - 1);
        }
    },
    //下一步
    goNext: function(){
        var _this = this;
        let cur = _this.state.current;
        //alert(cur+"==="+_this.state.totalPage)
        if(cur < _this.state.totalPage){
            _this.pageClick(cur + 1);
        }
    },
    goEnd: function(){
        var _this = this;
        let cur = this.state.current;
        if(cur != _this.state.totalPage){
            _this.pageClick(_this.state.totalPage);
        }
    },
    //跳转到指定页
    goSwitchChange: function(e){
            var _this= this;
            _this.setState({goValue : e.target.value})
            var value = e.target.value;
            //alert(value+"==="+_this.state.totalPage)
            if(!/^[1-9]\d*$/.test(value)){

            }else if(parseInt(value) > parseInt(_this.state.totalPage)){

            }else{
                _this.pageClick(value);
            }
    },
    render: function() {
        return (
            !this.state.noAccessToken ?
            <div>
                <SearchFile />
                <div className="alert alert-info with-icon" style={this.state.isLoading ? {display: 'block'} : {display: 'none'} }>
                  <i className="icon icon-spin icon-refresh"></i>
                  <h2 className="content">正在加载</h2>
                </div>
                <div className="alert alert-warning with-icon" style={this.state.isError ? {display: 'block'} : {display: 'none'} }>
                  <i className="icon-frown"></i>
                  <h2 className="content"><strong>提示：</strong>看起来遇到了一些问题。请重新加载一下吧</h2>
                </div>
                <table className="table table-bordered table-hover table-striped">
                    <thead>
                        <tr>
                            <th><span style={{float:'left'}}>文件 / 目录名</span></th>
                            <th className="hidden-xs"><span style={{float:'left'}}>文件 / 目录ID</span></th>
                            <th className="hidden-xs"><span style={{float:'left'}}>创建日期</span></th>
                            <th><span style={{float:'left'}}>大小</span></th>
                            <th><span style={{float:'left'}}>操作</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.filesList.map(function(item){
                            return <TableItem toFolder={this.toFolder} item={item}/>
                        }.bind(this))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <th colSpan="4">
                               <GetLink currentList={this.state.filesList} currentFloderList={this.state.totalData} isLoading={this.state.isLoading}/>
                            </th>
                            <th colSpan="1">
                               <div className="pull-right">
                                    <button type="button" onClick={this.load} className={this.state.isLoading ? 'btn btn-danger disabled' : 'btn btn-success'}>
                                        <i className="icon-refresh"></i> 重新加载
                                    </button>
                                </div>
                            </th>
                        </tr>
                        <tr>
                            <th colSpan="6">
                                <PageComponent total={this.state.totalNum}
                                              current={this.state.current}
                                              totalPage={this.state.totalPage}
                                              goValue={this.state.goValue}
                                              pageClick={this.pageClick.bind(this)}
                                              goIndex={this.goIndex.bind(this)}
                                              goPrev={this.goPrevClick.bind(this)}
                                              goNext={this.goNext.bind(this)}
                                              goEnd={this.goEnd.bind(this)}
                                              switchChange={this.goSwitchChange.bind(this)}
                                />
                            </th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            :
            <div className="container">
                <div className="alert alert-danger with-icon">
                    <i className="icon-remove-sign"></i>
                    <div className="content">
                        呃呃呃，你好像还有获取授权呢。。<a className="alert-link" href="admin/auth/">点击这儿</a>进行跃迁！
                    </div>
                </div>
            </div>
        );
    }
});

var PageComponent = React.createClass({
    render: function (){
        let _this = this;
        //当前页码
        let cur = this.props.current;
        //显示分页按钮
        let pageNum = [];
        let begin;
        let len;
        if(_this.props.totalPage > 5){
            len = 5;
            if(cur >= (_this.props.totalPage-2)){
                begin = _this.props.totalPage - 4;
            }else if(cur <= 3){
                begin = 1;
            }else{
                begin = cur - 2;
            }
        }else{
            len = _this.props.totalPage;
            begin = 1;
        }
        //根据返回的总记录数计算当前页显示的数据
        for(let i = 0; i < len; i ++){
            let cur = this.props.current;
            let showI = begin + i;
            if(cur == showI){
                pageNum.push({num : showI, cur : true});
            }else{
                pageNum.push({num : showI, cur : false});
            }
        }
        return(
            <div className="text-center">
                <ul className="pager">
                    <li className={this.props.current == 1? 'visible-md visible-lg inline disabled' : 'visible-md visible-lg inline'}>
                        <a onClick={this.props.goIndex.bind(this)}>首页</a>
                    </li>
                    <li className={this.props.current == 1? 'previous disabled' : 'previous'}>
                        <a onClick={this.props.goPrev.bind(this)}>«<span className="visible-md visible-lg inline"> 上一页</span></a>
                    </li>
                    {
                         pageNum.map(function(curPageNum){
                            return(
                                <li className={curPageNum.cur ? 'num active' : 'num'}>
                                    <a onClick = {_this.props.pageClick.bind(_this,curPageNum.num)}>{curPageNum.num}</a>
                                </li>
                            )
                        })
                    }
                        <li className={this.props.current == this.props.totalPage? 'next disabled' : 'next'} onClick={this.props.goNext.bind(this)}>
                            <a><span className="visible-md visible-lg inline">下一页 </span>»</a>
                        </li>
                        <li className={this.props.current == this.props.totalPage? 'visible-md visible-lg inline disabled' : 'visible-md visible-lg inline'}>
                            <a onClick={this.props.goEnd.bind(this)}>末页</a>
                        </li>
                  </ul>
                  <div className="row">
                      总共<strong>{_this.props.total}</strong>条，
                      共
                      <strong>{_this.props.totalPage}</strong>
                      页，到第
                      <input type="number" value={_this.props.goValue} onChange={this.props.switchChange.bind(this)} className="input-xs"/>
                      页
                  </div>
            </div>
        )
    }
});


var TableItem = React.createClass({
    render: function() {
        return (
            <tr>
                {
                    this.props.item.folder ?
                        <td className="word-break"><a href="javascript:void(0);" onClick={this.props.toFolder.bind(this, this.props.item.id, this.props.item.name)}>{this.props.item.name + '/'}</a></td>
                    :
                        <td className="word-break">{this.props.item.name}</td>
                }
                <td className="hidden-xs">{this.props.item.id}</td>
                <td className="hidden-xs">{this.props.item.createDate}</td>
                <td>{
                    this.props.item.size ?
                        (this.props.item.size/1024/1024)>=1024 ?(this.props.item.size/1024/1024/1024).toFixed(2)+'GB':
                                                                (this.props.item.size/1024/1024).toFixed(2)+'MB'
                        : '/'
                    }</td>
                {
                    this.props.item.folder ?
                        <td><a href="#" className="btn disabled"><i className="icon-download"></i> 下载</a></td>
                    :
                        <td>
                        <a href={this.props.item.folder ? this.props.item.id : window.location.protocol + '//' + document.domain + (location.port ? ':' + location.port : '') + '/admin/link/' + this.props.item.id + '/' + this.props.item.name} className="btn btn-primary" target="_blank"><i className="icon-download"></i> 下载</a>&nbsp;
                        {
                            this.props.item.icon ?
                                 <a data-toggle="modal" href={this.props.item.icon[0].largeUrl[0]} data-target={'#'+this.props.item.id} className="btn btn-primary"><i className="icon-picture"></i> 预览图片</a>
                                : ''
                        }
                        {this.props.item.icon ?
                            <div className="modal fade" id={this.props.item.id}>
                              <div className="modal-dialog modal-lg">
                                  <div className="modal-body text-center">
                                    <img src={this.props.item.icon[0].largeUrl[0]} alt={this.props.item.id}/>
                                  </div>
                              </div>
                            </div>
                            : ''
                        }
                        </td>
                }
            </tr>
        )
    }
});

var GetLink = React.createClass({
    getInitialState: function() {
        return {
            getData: []
        };
    },
    getCurrentFloderList: function(){
        var temp = [];
        if(this.props.currentFloderList != undefined)
            this.props.currentFloderList.map(function(filesItem){
            if(filesItem.folder == false) temp.push({
                id: filesItem.id,
                name: filesItem.name,
                md5: filesItem.md5
            });
        });
        this.setState({getData:temp});
    },
    getCurrentList:function(){
        var temp = [];
        if(this.props.currentList != undefined)
            this.props.currentList.map(function(filesItem){
            if(filesItem.folder == false) temp.push({
                id: filesItem.id,
                name: filesItem.name,
                md5: filesItem.md5
            });
        });
        this.setState({getData:temp});
    },
    render: function(){
        return (
            <div>
                批量获取:
                <button className={this.props.isLoading ? 'btn btn-info disabled' : 'btn btn-info'} type="button" onClick={this.getCurrentFloderList} data-toggle="modal" data-target="#GetLink">当前目录</button>
             &nbsp;<button className={this.props.isLoading ? 'btn btn-warning disabled' : 'btn btn-warning'} type="button" onClick={this.getCurrentList} data-toggle="modal" data-target="#GetLink">当前页</button>
                <div className="modal fade" id="GetLink">
                  <div className="modal-dialog modal-lg">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">×</span><span className="sr-only">关闭</span></button>
                        <h4 className="modal-title">链接如下</h4>
                    </div>
                    <div className="modal-body">
                        <table className="table table-bordered table-hover table-striped">
                          <thead>
                              <tr>
                                  <th><span style={{float:'left'}}>文件名</span></th>
                                  <th><span style={{float:'left'}}>MD5</span></th>
                                  <th><span style={{float:'left'}}>链接</span></th>
                              </tr>
                          </thead>
                          <tbody>
                              {
                                  this.state.getData.map(function(item){
                                      return <ShowLink item={item} />;
                                  })
                              }
                          </tbody>
                      </table>
                    </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">关闭</button>
                      </div>
                  </div>
                </div>
            </div>
        )
    }
});

var ShowLink = React.createClass({
    render: function(){
        return (
            <tr>
                <td className="word-break">{this.props.item.name}</td>
                <td className="word-break">{this.props.item.md5}</td>
                <td>
                <p className="word-break">{this.props.item.folder ? this.props.item.id : window.location.protocol + '//' + document.domain + (location.port ? ':' + location.port : '') + '/admin/link/' + this.props.item.id + '/'+ this.props.item.name}</p>
                </td>
            </tr>
        )
    }
});

var SearchFile = React.createClass({
    getInitialState: function() {
        return {
            searchList : [], //存放数据数组
            isLoading: false,//是否在加载
            isError: false,//是否出现错误
        };
    },
    handleClick: function() {
        let temp = [];
        var inputVaule = this.refs.searchValue.value;
        this.setState({isLoading: true,isError: false});
        $.post('/admin/search/',{
                filename: inputVaule
            },function(data){
                if(data.error){
                    this.setState({searchList: [],isLoading: false,isError: true});
                    return;
                }
                if(data.searchFileList.folder != undefined)
                    data.searchFileList.folder.map(function(foldersItem){
                        foldersItem.folder = true;
                        temp.push(foldersItem);
                    });
                if(data.searchFileList.file != undefined)
                    data.searchFileList.file.map(function(filesItem){
                        filesItem.folder = false;
                        temp.push(filesItem);
                    });
                this.setState({searchList: temp,isLoading: false,isError: false});
            }.bind(this));
    },
    render: function() {
        return (
            <div style={{padding: '6px 0'}}>
                <div className="input-group col-md-8 col-sm-7 center-block">
                    <span className="input-group-addon"><i className="icon-search"></i></span>
                     <input type="text" className="form-control" ref="searchValue" placeholder="请输入你想搜索的文件/目录"/>
                     <span className="input-group-btn">
                        <button type="button" className="btn btn-default" onClick={this.handleClick} data-toggle="modal" data-target="#SearchData"><i className="icon icon-search"></i>查询</button>
                    </span>
                </div>
                <div className="modal fade" id="SearchData">
                  <div className="modal-dialog modal-lg">
                    <div className="modal-header">
                        <button type="button" className="close" data-dismiss="modal"><span aria-hidden="true">×</span><span className="sr-only">关闭</span></button>
                        <h4 className="modal-title">搜索结果</h4>
                      </div>
                      <div className="modal-body">
                        <div className="alert alert-info with-icon" style={this.state.isLoading ? {display: 'block'} : {display: 'none'} }>
                          <i className="icon icon-spin icon-refresh"></i>
                          <h2 className="content">正在加载</h2>
                        </div>
                        <div className="alert alert-warning with-icon" style={this.state.isError ? {display: 'block'} : {display: 'none'} }>
                          <i className="icon-frown"></i>
                          <h2 className="content"><strong>提示：</strong>看起来遇到了一些问题。请重新搜索一下吧</h2>
                        </div>
                        {   this.state.searchList.length ?
                            <table className="table table-bordered table-hover table-striped">
                              <thead>
                                  <tr>
                                      <th><span style={{float:'left'}}>文件/目录名</span></th>
                                      <th className="hidden-xs"><span style={{float:'left'}}>文件/目录ID</span></th>
                                      <th><span style={{float:'left'}}>大小</span></th>
                                      <th><span style={{float:'left'}}>MD5</span></th>
                                      <th><span style={{float:'left'}}>文件类型</span></th>
                                      <th><span style={{float:'left'}}>操作</span></th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {
                                      this.state.searchList.map(function(item){
                                          return <ShowSearch item={item} />;
                                      })
                                  }
                              </tbody>
                          </table>
                          : <h2>没有检索到数据。</h2>
                         }
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-default" data-dismiss="modal">关闭</button>
                      </div>
                  </div>
                </div>
            </div>
        );
    }
});

var ShowSearch = React.createClass({
    render: function(){
        return(
            <tr>
                {
                    this.props.item.folder ?
                        <td className="word-break"><a href="javascript:void(0);">{this.props.item.name + '/'}</a></td>
                    :
                        <td className="word-break">{this.props.item.name}</td>
                }
                <td className="hidden-xs word-break">{this.props.item.id}</td>
                <td>{
                    this.props.item.size ?
                        (this.props.item.size/1024/1024)>=1024 ?(this.props.item.size/1024/1024/1024).toFixed(2)+'GB':
                                                                (this.props.item.size/1024/1024).toFixed(2)+'MB'
                        : '/'
                    }
                </td>
                <td className="word-break">{this.props.item.md5 ? this.props.item.md5 : '/'}</td>
                <td>
                    {this.props.item.mediaType ?
                        this.props.item.mediaType == 0 ? '其他' :
                            this.props.item.mediaType == 1 ? '图片' :
                                this.props.item.mediaType == 2 ? '音乐' :
                                    this.props.item.mediaType == 3 ? '视频' :
                                        this.props.item.mediaType == 4 ? '文档' : '??'
                        : '目录'
                    }
                </td>
                {
                    this.props.item.folder ?
                        <td><button className="btn btn-primary disabled"><i className="icon-download"></i> 不可操作</button></td>
                    :
                        <td>
                        <a href={this.props.item.folder ? this.props.item.id : window.location.protocol + '//' + document.domain + (location.port ? ':' + location.port : '') + '/admin/link/' + this.props.item.id + '/'+ this.props.item.name} className="btn btn-primary" target="_blank"><i className="icon-download"></i> 下载</a>
                        {
                            this.props.item.icon ?
                                 <a style={{margin: '2px 0'}} href={this.props.item.icon[0].mediumUrl[0]} className="btn btn-primary" target="_blank"><i className="icon-picture"></i> 预览图片</a>
                                : ''
                        }
                        </td>
                }
            </tr>
        )
    }
});



React.render(<CloudLink />, document.getElementById('app'));
