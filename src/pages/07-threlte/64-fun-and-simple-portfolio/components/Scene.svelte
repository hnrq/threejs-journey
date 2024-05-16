<script lang="ts">
  import { T } from '@threlte/core';
  import { GLTF, Float, HTML, Text3DGeometry, OrbitControls } from '@threlte/extras';
</script>

<T.Color args={['#ddd']} attach="background" />

<Float rotationIntensity={0.4}>
  <GLTF
    url="https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/iphone-x/model.gltf"
    useDraco
    position={[-1.2, -1.0, 0]}
  >
    <HTML transform wrapperClass="htmlScreen" distanceFactor={1.17} position={[0.18, 1.32, 0.1]}>
      <iframe src="https://hnrq.dev/" title="portfolio" />
    </HTML>
  </GLTF>

  <T.Mesh position={[0, 0.75, 0]} maxWidth={2}>
    <Text3DGeometry
      font="/fonts/helvetiker_regular.typeface.json"
      size={0.25}
      height={0.05}
      text="HNRQ"
    />
    <T.MeshBasicMaterial color="#111" />
  </T.Mesh>
</Float>

<style global>
  iframe {
    height: 1100px;
    width: 500px;
    border: none;
    border-radius: 80px;
  }
</style>
