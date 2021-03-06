import React from 'react';
import { Platform, View, Image } from 'react-native';
import PropTypes from 'prop-types';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import emojiUtils from 'emoji-utils';
import { addChat } from "./actions/chats";
import SlackMessage from './SlackMessage';
import { connect } from "react-redux";
import { fetchDataSuccess, fetchDataRequest, fetchDataError } from "./actions/user";
import { addMessage, recieveMessage } from "./actions/chats";
import moment from 'moment';
import KeyboardSpacer from 'react-native-keyboard-spacer';
const io = require('socket.io-client');
var server = require('./config')

class Chat extends React.Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props; 
    this.state = {
      messages: [
      ],
      to: navigation.getParam('username')
    };
    
    const aqui = this
  }
  static navigationOptions = ({ navigation })=>{
    return {
      title: navigation.getParam('username'),
      headerStyle: {
        backgroundColor: '#124734',
      },
      headerTintColor: '#fff'
    }
  };
  static getDerivedStateFromProps(props, state) {
    if(props.chats&&props.chats[state.to]){
      props.chats[state.to].forEach((element, i) => {
        var id = 1; var user = props.user.username;
        if(element.user != user){ id = 2; user = state.to }
        state.messages[i] = {
          _id: i,
          text: element.text,
          createdAt: element.timestamp,
          user:{
            _id: id,
            name: user,
          }
        };
      });
      return{
        messages: GiftedChat.append([],state.messages)
      }
    }
    
  }
  
  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  renderMessage(props) {
    const { currentMessage: { text: currText } } = props;

    let messageTextStyle;

    // Make "pure emoji" messages much bigger than plain text.
    if (currText && emojiUtils.isPureEmojiString(currText)) {
      messageTextStyle = {
        fontSize: 28,
        // Emoji get clipped if lineHeight isn't increased; make it consistent across platforms.
        lineHeight: Platform.OS === 'android' ? 34 : 30,
      };
    }

    return (
      <SlackMessage {...props} messageTextStyle={messageTextStyle} />
    );
  }

  renderSend(props) {
    return (
        <Send
            {...props}
        >
            <View style={{marginRight: 2, marginBottom: 0}}>
                <Image source={require('./assets/img/send-button.png')}  resizeMode={'center'}/>
            </View> 
        </Send>
    );
}

  render() {
    return (
      <Container>
        <Content>
          <GiftedChat
            messages={this.state.messages.reverse()}
            placeholder='Escribe un mensaje'
            onSend={messages => this.onSend(messages)}
            user={{
              _id: 1
            }}
            //renderMessage={this.renderMessage}
            renderSend={this.renderSend}
          />
          {Platform.OS === 'android' ? <KeyboardSpacer /> : null }
        </Content>
      </Container>
    );
  }

}
function bindAction(dispatch) {
  return {
    fetchDataUser: user => dispatch(fetchDataSuccess(user)),
    addMessage: data => dispatch(addMessage(data)),
    recieveMessage: data => dispatch(recieveMessage(data)),
  };
}

const mapStateToProps = state => ({
  user: state.userReducer.user,
  chats: state.chatsReducer.data,
  last_update: state.chatsReducer.last_update,
});
export default connect(
  mapStateToProps,
  bindAction
)(Chat);
