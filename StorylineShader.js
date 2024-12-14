const StorylineShader = {

	name: 'StorylineShader',

	uniforms: {		

	},

	vertexShader: /* glsl */ `

    uniform float _curvatureStrength;
                
		varying vec2 vUv;
   
		void main() {
      vUv = uv;
      vec3 posOS = position * 0.8;
      vec4 worldPosition = modelMatrix * vec4(posOS, 1.0);     
      vec3 viewDir = normalize(worldPosition.xyz - cameraPosition);
      float viewDist = length(worldPosition.xyz - cameraPosition) - cameraPosition.z;

      vec3 pos = worldPosition.xyz;
      pos.xy = pos.xy + viewDir.xy * pow(viewDist, 2.0) * _curvatureStrength;
      //pos.xy *= 0.8;
      gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);

		}
    `,

  fragmentShader: /* glsl */ `

    uniform sampler2D _mainTex;
    uniform sampler2D _maskTex;
    uniform vec3 _objPos;
    uniform float _imageSlideSterngth;
    uniform bool _isScroll;
    uniform float _scrollSpeed;
    uniform float _time;
    uniform float _aspectRatio;
    
    varying vec2 vUv; 

    vec2 aspectUV(vec2 uv, float aspect){
      return vec2(uv.x, uv.y * aspect) - vec2(0.0, fract(aspect)/2.0);
    }
  
    void main() {

      vec2 uv = vUv * 2.0 - 1.0; // centre UV
      uv = uv * 0.4 + 0.5;     
      
      if(_isScroll)
        uv = vec2(uv.x + _time * _scrollSpeed, uv.y);
            
      uv = uv + (_objPos.xy - cameraPosition.xy) * _imageSlideSterngth;  // move image with relative camera position

      //aspect
      uv = aspectUV(uv, _aspectRatio);
      vec2 maskUv = aspectUV(vUv, _aspectRatio);

      
      vec4 col = texture(_mainTex, uv);
      vec4 mask;
      if(maskUv.x > 0.0 && maskUv.x < 1.0 && maskUv.y > 0.0 && maskUv.y < 1.0)
        mask = texture(_maskTex, maskUv);
      else
        mask = vec4(0.0);
              
      gl_FragColor = vec4(col.rgb, mask.a);

    }
  `,
  lights: true

};

export { StorylineShader };
