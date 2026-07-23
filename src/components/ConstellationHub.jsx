import { useNavigate } from "react-router-dom";

function Constellation({
  position,
  name,
  route
}) {

  const navigate = useNavigate();

  return (
    <group
      position={position}
      onClick={() => navigate(route)}
    >

      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />

        <meshBasicMaterial
          color="#dbeafe"
        />
      </mesh>

    </group>
  );
}

export default function ConstellationHub() {

  return (
    <>

      

 


      

    </>
  );
}