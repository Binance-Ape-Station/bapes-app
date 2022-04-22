import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react/cjs/react.development';
import { SET_SOUND_ENABLED } from 'src/store';

export default function SoundHelper() {
  const dispatch = useDispatch();
  const soundEnabled = useSelector(state => state.app.soundEnabled);

  return (
    <div className="sound-helper">
      <button className="dis" onClick={() => dispatch({ type: SET_SOUND_ENABLED, enabled: !soundEnabled })}>
        {soundEnabled ? 
          (<i className="fal fa-volume-up"></i>)
          :
          (<i className="fal fa-volume-mute"></i>)
        }
      </button>
    </div>
  );
}
