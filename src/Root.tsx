import React from "react";
import { Composition } from "remotion";
import { ShelterDogs } from "./ShelterDogs";

export const Root: React.FC = () => {
  return (
    <Composition
      id="ShelterDogs"
      component={ShelterDogs}
      durationInFrames={300}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
