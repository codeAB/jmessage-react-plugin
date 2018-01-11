'use strict';

import React from 'react';
import ReactNative, { ScrollView } from 'react-native';
import JMessage from 'jmessage-react-plugin';

import FormButton from '../../../views/FormButton'

const {
    View,
    Text,
    TouchableHighlight,
    StyleSheet,
    Button,
    Alert,
    TextInput,
    FlatList,
    Image,
    Modal,
} = ReactNative;


const styles = StyleSheet.create({
    icon: {
        width: 26,
        height: 26,
    },
    conversationContent: {
        borderBottomWidth: 1,
        borderColor: "#cccccc",
        height: 60,
    },
    conversationItem: {
        flexDirection: 'row',
        margin: 10,
        alignItems: 'center',
    },
    conversationAvatar: {
        width: 45,
        height: 45,
        marginRight: 10,
    },

    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        height: 300,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    modalButton: {
        margin: 10,
    },
    inputStyle: {
        width: 200
    }
});

var count = 0

//   headerRight: <Button 
//   title="创建会话" 
//   onPress={
//       ({state}) => {
//           Alert.alert('state', JSON.stringify(state.params))

//       }}
//   />,

export default class ConversationList extends React.Component {
    static navigationOptions = ({
        navigation
    }) => {
        const {
            params = {}
        } = navigation.state;
        return {
            headerRight: <Button title="创建会话" onPress={() => { params.createConversation() }} />,
            title: "会话",
            tabBarLabel: '会话',
            tabBarIcon: ({
                tintColor
            }) => (
                    <Image
                        source={require('../../../resource/chat-icon.png')}
                        style={[styles.icon, { tintColor: tintColor }]}
                    />
                ),
        }
    };

    _onCreateConversation() {
        this.setState({
            isShowModal: true
        })
    }

    constructor(props) {
        super(props);
        this.state = {
            data: [{
                key: 'a'
            }, {
                key: 'b'
            }],
            modalText: "",
            isShowModal: false,
        }
        this._onCreateConversation = this._onCreateConversation.bind(this)
    }

    componentDidMount() {
        this.props.navigation.setParams({
            createConversation: this._onCreateConversation
        });
        JMessage.setDebugMode({
            enable: true
        });
    }
    componentWillMount() {
        this.reloadConversationList()
    }

    reloadConversationList() {
        JMessage.getConversations((result) => {

            var data = result.map((conversation, index) => {
                var item = {}
                item.key = index
                item.conversation = conversation
                if (conversation.conversationType === 'single') {
                    item = {
                        key: conversation.target.username
                    }
                    item.conversationType = 'single'
                    item.displayName = conversation.target.nickname
                    if (item.displayName == "") {
                        item.displayName = conversation.target.username
                    }
                } else {
                    item = {
                        key: conversation.target.id
                    }
                    item.conversationType = 'group'
                    item.displayName = conversation.target.name
                }

                if (conversation.latestMessage === undefined) {
                    item.latestMessageString = ""
                    return item
                }

                item.conversationType = conversation.conversationType
                if (conversation.latestMessage.type === 'text') {
                    item.latestMessageString = conversation.latestMessage.text
                }

                if (conversation.latestMessage.type === 'image') {
                    item.latestMessageString = '[图片]'
                }

                if (conversation.latestMessage.type === 'voice') {
                    item.latestMessageString = '[语音]'
                }

                if (conversation.latestMessage.type === 'file') {
                    item.latestMessageString = '[文件]'
                }

                return item
            })
            this.setState({
                data: data
            })
        }, (error) => {
            Alert.alert(JSON.stringify(error))
        })
    }

    _onPress() {
        JMessage.createConversation({
            type: 'single',
            username: '0002'
        }, (conv) => {
            var item
            if (conv.conversationType === 'single') {
                item = {
                    key: conv.target.username
                }
                item.conversationType = 'single'
            } else {
                item = {
                    key: conv.target.id
                }
                item.conversationType = 'group'
            }
            this.setState({})
            Alert.alert('the item', JSON.stringify(item))
            this.props.navigation.navigate('Chat', {
                conversation: item
            })
        }, (error) => {
            Alert.alert('error', JSON.stringify(error))
        })
    }

    enterConversation(params) {
        JMessage.createConversation(params, (conv) => {
            var item = {}

            if (conv.conversationType === 'single') {
                item = {
                    key: conv.target.username
                }
                item.conversationType = 'single'
            } else {
                item = {
                    key: conv.target.id
                }
                item.conversationType = 'group'
            }
            this.reloadConversationList()
            this.props.navigation.navigate('Chat', {
                conversation: item
            })
        }, (error) => {
            Alert.alert('create conversation error !', JSON.stringify(error))
        })
    }

    enterChatRoom(params) {
        JMessage.enterChatRoom(params.roomId, (conversation) => {
            var chatRoom = {
                conversationType: 'chatroom',
                key: conversation.roomId,
                owner: conversation.owner,
                totalMemberCount: conversation.totalMemberCount
            }
            this.props.navigation.navigate('Chat', {
                conversation: chatRoom
            })
        }, (error) => {
            console.alert("error, code: " + error.code + ", description: " + error.description)
        })
    }

    render() {
        this.listView = <FlatList
            data={
                this.state.data
            }
            renderItem={
                ({
                    item
                }) => (
                        <View>
                            <TouchableHighlight
                                style={[styles.conversationContent]}
                                underlayColor='#dddddd'
                                onPress={() => {
                                    this.props.navigation.navigate('Chat', { conversation: item })
                                }}>
                                <View style={[styles.conversationItem]}>
                                    <Image
                                        source={require('../../../resource/group-icon.png')}
                                        style={[styles.conversationAvatar]}>
                                    </Image>
                                    <View>
                                        <Text>{item.displayName}</Text>
                                        <Text>{item.latestMessageString}</Text>
                                    </View>
                                </View>
                            </TouchableHighlight>
                        </View>
                    )
            } >

        </FlatList>
        return (

            <View>
                <Modal
                    transparent={true}
                    visible={this.state.isShowModal}>
                    <View
                        style={styles.modalView}>
                        <View
                            style={styles.modalContent}>
                            <TextInput
                                style={styles.inputStyle}
                                placeholder="用户名或群聊名称"
                                onChangeText={(e) => { this.setState({ modalText: e }) }}>
                            </TextInput>
                            <Button
                                onPress={() => {
                                    var params = {}
                                    params.type = 'single'
                                    params.username = this.state.modalText
                                    this.setState({ isShowModal: false })
                                    this.enterConversation(params)
                                }}
                                style={styles.modalButton}
                                title='创建单聊' />
                            <Button
                                onPress={() => {

                                    JMessage.createGroup({ name: this.state.modalText, desc: "" }, (group) => {
                                        var params = {}
                                        params.type = 'group'
                                        params.groupId = group.id
                                        this.setState({ isShowModal: false })
                                        this.enterConversation(params)
                                    }, (error) => {
                                        Alert.alert('create group error !', JSON.stringify(error))
                                    })

                                }}
                                style={styles.modalButton}
                                title='创建群聊' />
                            <Button
                                onPress={() => {
                                    JMessage.createChatRoomConversation("1000", (conversation) => {
                                        var params = {
                                            type: conversation.type,
                                            roomId: conversation.roomId,
                                            name: conversation.roomName,
                                            appKey: conversation.appKey,
                                            owner: conversation.owner,
                                        }
                                        this.setState({ isShowModal: false })
                                        this.enterChatRoom(params)
                                    })
                                }}
                                style={styles.modalButton}
                                title='创建聊天室' />

                            <Button
                                onPress={() => { this.setState({ isShowModal: false }) }}
                                style={styles.modalButton}
                                title='离开' />
                        </View>

                    </View>
                </Modal>
                {this.listView}
            </View>)
    }
}