import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { RootState } from 'src/store';

export default async function SetupSocketConnection(user: any) {
  try {
    return;
    if (!user) return;

    const URL = 'http://localhost:5000/alerts';
    const socket = io(URL, {
      transports: ['websocket']
    });

    socket.on('connect', function () {
      socket.emit('join', user?.id);

      // listen to update-app event to update application in case new plan upgraded;
      socket.on('update-app', function (data) {
        console.log('update-app event => ' + data);
        window.location.reload();
      });
    });

    socket.on('connect_error', function (err) {
      console.log(err?.message);
    });
  } catch (error) {
    console.log('error');
  }
}
